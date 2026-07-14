from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import os
import asyncio
from datetime import datetime, timedelta
import random

from nlp import analyze_ticket_text
from risk_scoring import calculate_risk_score
from llm_drafter import draft_response

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="EscalateAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State for Simulation
SIMULATION_STATE = {
    "is_running": False,
    "current_simulated_time": datetime.now(),
    "active_tickets": [],
    "unreleased_tickets": [],
    "resolved_tickets": [],
    "team_overload_alerts": []
}

TIME_MULTIPLIER = 60  # 1 real second = 60 simulated seconds (1 minute)

def load_seed_data():
    tickets = []
    tiers = ["Free", "Free", "Free", "Pro", "Pro", "Enterprise"]
    file_path = "data/dataset-tickets-multi-lang3-4k.csv"
    
    if not os.path.exists(file_path):
        print(f"Warning: Dataset not found at {file_path}. Please ensure it is present.")
        return []
        
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            if not row.get("subject"): continue
            
            # Use random tier for demonstration purposes since the dataset lacks it
            tier = random.choice(tiers)
            
            t = {
                "id": f"TKT-{1000 + count}",
                "subject": row.get("subject", "No Subject"),
                "description": row.get("body", ""),
                "priority": row.get("priority", "normal").capitalize(),
                "customer_tier": tier,
                "category": row.get("queue", "General Support"),
                "language": row.get("language", "en")
            }
            
            # Pre-process with NLP
            nlp_res = analyze_ticket_text(t["description"])
            t["nlp_analysis"] = nlp_res
            t["llm_draft"] = None
            t["risk_breakdown"] = {}
            t["risk_score"] = 0.0
            
            tickets.append(t)
            count += 1
            if count >= 1000: # Limit to 1000 for memory and performance of the demo
                break
                
    return tickets

@app.on_event("startup")
async def startup_event():
    SIMULATION_STATE["unreleased_tickets"] = load_seed_data()
    SIMULATION_STATE["current_simulated_time"] = datetime.now()
    asyncio.create_task(simulation_loop())

async def simulation_loop():
    SIMULATION_STATE["is_running"] = True
    while SIMULATION_STATE["is_running"]:
        await asyncio.sleep(1) # tick every real second
        
        SIMULATION_STATE["current_simulated_time"] += timedelta(seconds=TIME_MULTIPLIER)
        current_time = SIMULATION_STATE["current_simulated_time"]
        
        # Release new tickets to simulate a busy queue
        # Release 1-3 tickets per tick if we have less than 50 active
        if len(SIMULATION_STATE["unreleased_tickets"]) > 0 and len(SIMULATION_STATE["active_tickets"]) < 100:
            num_to_release = random.randint(1, 3)
            for _ in range(num_to_release):
                if SIMULATION_STATE["unreleased_tickets"]:
                    new_ticket = SIMULATION_STATE["unreleased_tickets"].pop(0)
                    new_ticket["created_at"] = current_time.isoformat()
                    SIMULATION_STATE["active_tickets"].append(new_ticket)

        active_count = len(SIMULATION_STATE["active_tickets"])
        total_risk = 0
        
        for ticket in SIMULATION_STATE["active_tickets"]:
            risk_info = calculate_risk_score(
                ticket, 
                current_time, 
                active_count, 
                ticket["nlp_analysis"]["urgency_multiplier"]
            )
            ticket["risk_breakdown"] = risk_info
            ticket["risk_score"] = risk_info["final_risk_score"]
            total_risk += ticket["risk_score"]
            
            # Check for individual ticket breach
            if ticket["risk_score"] >= 100.0 and not ticket.get("breach_alert_sent"):
                alert_msg = f"Ticket Breach: {ticket['id']} ({ticket['subject'][:30]}...) exceeded 100% risk limit."
                SIMULATION_STATE["team_overload_alerts"].append({
                    "timestamp": current_time.isoformat(),
                    "message": alert_msg
                })
                ticket["breach_alert_sent"] = True
            
        # Draft LLM response if high risk and not drafted yet
            if risk_info["is_high_risk"] and not ticket["llm_draft"]:
                ticket["llm_draft"] = draft_response(ticket)
        
        # Randomly resolve some tickets to keep the queue dynamic
        if len(SIMULATION_STATE["active_tickets"]) > 0:
            if random.random() < 0.2: # 20% chance to resolve 1-3 tickets
                num_to_resolve = min(random.randint(1, 3), len(SIMULATION_STATE["active_tickets"]))
                for _ in range(num_to_resolve):
                    idx = random.randint(0, len(SIMULATION_STATE["active_tickets"]) - 1)
                    resolved = SIMULATION_STATE["active_tickets"].pop(idx)
                    resolved["resolved_at"] = current_time.isoformat()
                    SIMULATION_STATE["resolved_tickets"].append(resolved)

        # Sort queue by highest risk
        SIMULATION_STATE["active_tickets"].sort(key=lambda x: x["risk_score"], reverse=True)
        
        # Check team overload (e.g. if average risk > 60)
        avg_risk = total_risk / active_count if active_count > 0 else 0
        if avg_risk > 60:
            alert_msg = f"Alert: High team load! Active tickets: {active_count}, Avg Risk: {round(avg_risk,1)}%"
            if not SIMULATION_STATE["team_overload_alerts"] or not SIMULATION_STATE["team_overload_alerts"][-1]["message"].startswith("Alert: High team load"):
                 SIMULATION_STATE["team_overload_alerts"].append({
                     "timestamp": current_time.isoformat(),
                     "message": alert_msg
                 })

@app.get("/api/queue")
def get_queue():
    return {
        "current_time": SIMULATION_STATE["current_simulated_time"].isoformat(),
        "tickets": SIMULATION_STATE["active_tickets"]
    }

@app.get("/api/team-stats")
def get_team_stats():
    active_count = len(SIMULATION_STATE["active_tickets"])
    avg_risk = sum(t["risk_score"] for t in SIMULATION_STATE["active_tickets"]) / active_count if active_count > 0 else 0
    agents_online = 12 + random.randint(-2, 2)
    return {
        "active_tickets": active_count,
        "average_risk": round(avg_risk, 1),
        "alerts": SIMULATION_STATE["team_overload_alerts"][-10:],
        "agents_online": agents_online
    }

@app.post("/api/reset")
def reset_simulation():
    SIMULATION_STATE["unreleased_tickets"] = load_seed_data()
    SIMULATION_STATE["active_tickets"] = []
    SIMULATION_STATE["resolved_tickets"] = []
    SIMULATION_STATE["team_overload_alerts"] = []
    SIMULATION_STATE["current_simulated_time"] = datetime.now()
    return {"status": "reset"}

@app.get("/api/analytics")
def get_analytics():
    resolved_tickets = SIMULATION_STATE["resolved_tickets"]
    # Group by category (queue)
    category_stats = {}
    total_resolution_time = 0
    total_resolved = len(resolved_tickets)
    
    for t in resolved_tickets:
        cat = t["category"]
        if not cat: cat = "Uncategorized"
        if cat not in category_stats:
            category_stats[cat] = {"category": cat, "breaches": 0, "met_sla": 0, "total": 0}
        
        # Determine actual breaches based on final risk score or nlp_analysis urgency
        is_breach = t.get("risk_score", 0) >= 100.0 or (t.get("nlp_analysis", {}).get("urgency_multiplier", 1.0) > 1.2)
        if is_breach:
            category_stats[cat]["breaches"] += 1
        else:
            category_stats[cat]["met_sla"] += 1
        category_stats[cat]["total"] += 1
        
        # Calculate resolution time
        if "created_at" in t and "resolved_at" in t:
            created = datetime.fromisoformat(t["created_at"])
            resolved = datetime.fromisoformat(t["resolved_at"])
            total_resolution_time += (resolved - created).total_seconds()
            
    avg_resolution_time_mins = 0
    if total_resolved > 0:
        avg_resolution_time_mins = (total_resolution_time / total_resolved) / 60
        
    data = list(category_stats.values())
    # Sort by total volume
    data.sort(key=lambda x: x["total"], reverse=True)
    # Take top 6 categories
    return {
        "historicalData": data[:6],
        "avg_resolution_time_mins": round(avg_resolution_time_mins)
    }

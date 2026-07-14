import datetime

# Base SLA targets in minutes (how quickly we WANT to resolve these)
SLA_TARGETS = {
    "Technical": 60,
    "Billing": 120,
    "Account": 120,
    "Default": 120
}

# How much more important is a tier compared to Free
TIER_MULTIPLIERS = {
    "Free": 1.0,
    "Pro": 1.5,
    "Enterprise": 2.5,
    "Default": 1.0
}

def calculate_risk_score(ticket: dict, current_time: datetime.datetime, active_queue_size: int, nlp_urgency: float) -> dict:
    """
    Calculates the live risk score for a ticket based on age, tier, NLP urgency, and queue load.
    Returns a dictionary with the breakdown of the score and the final risk percentage.
    """
    # 1. Base SLA
    category = ticket.get("category", "Default")
    base_sla_mins = SLA_TARGETS.get(category, SLA_TARGETS["Default"])
    
    # 2. Tier Multiplier
    tier = ticket.get("customer_tier", "Default")
    tier_multiplier = TIER_MULTIPLIERS.get(tier, TIER_MULTIPLIERS["Default"])
    
    # 3. Ticket Age in minutes
    created_at = datetime.datetime.fromisoformat(ticket["created_at"])
    age_delta = current_time - created_at
    age_mins = max(0, age_delta.total_seconds() / 60.0)
    
    # 4. Queue Load Factor
    # Cap the queue load factor so it doesn't inflate scores too heavily (max 1.2x multiplier)
    queue_load_factor = 1.0 + min(0.2, active_queue_size * 0.005)
    
    # 5. Risk Factor Calculation
    # Base risk based on static ticket properties
    base_risk = 10.0 * tier_multiplier * nlp_urgency
    
    # Time risk based on age relative to SLA
    time_risk = min(50.0, (age_mins / base_sla_mins) * 20.0) if base_sla_mins > 0 else 20.0
    
    # 6. Final Risk Calculation
    final_risk_raw = (base_risk + time_risk) * queue_load_factor
    final_risk_bounded = min(100.0, final_risk_raw)
    
    # Return rounded values for the UI
    return {
        "age_mins": round(age_mins, 1),
        "base_sla_mins": base_sla_mins,
        "tier_multiplier": tier_multiplier,
        "nlp_urgency": nlp_urgency,
        "queue_load_factor": round(queue_load_factor, 2),
        "final_risk_score": round(final_risk_bounded, 1),
        "is_breaching": final_risk_bounded >= 100.0,
        "is_high_risk": final_risk_bounded >= 80.0
    }

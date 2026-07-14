# EscalateAI

EscalateAI is a real-time support ticket escalation and SLA breach prediction system. It is designed to proactively identify high-risk support tickets by analyzing their text using NLP and predicting their likelihood to breach Service Level Agreements (SLAs).

This project demonstrates data engineering, NLP implementation, predictive modeling concepts, and full-stack development, making it an ideal portfolio piece for Data Analysts or Support Operations Engineers.

## Key Features

1. **NLP Urgency Scoring**: Analyzes incoming ticket text (using VADER sentiment analysis and targeted keyword matching) to catch tickets that are genuinely urgent but mislabeled by users as "Low Priority".
2. **Dynamic Breach Risk Prediction**: Continuously recalculates the risk of a ticket breaching its SLA based on:
   - Category-specific baseline SLA targets
   - Customer Tier (Free vs Pro vs Enterprise)
   - NLP Urgency Multipliers
   - Live Ticket Age
   - Real-time Queue Load (agent capacity pressure)
3. **Live Re-prioritization**: The active queue automatically re-sorts as ticket risk scores shift over simulated time.
4. **LLM Response Drafting**: Automatically generates a contextual first-response draft using the Google Gemini API for high-risk tickets to assist agents.
5. **Team Overload Alerts**: Monitors the aggregate risk of the entire queue and triggers alerts if the team falls behind.

## Tech Stack

- **Backend**: Python, FastAPI, VADER Sentiment, Google GenAI SDK, AsyncIO
- **Frontend**: React (Vite), TailwindCSS, Lucide Icons
- **Simulation**: Background asynchronous task loop simulating time passing and queue dynamics

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: if `requirements.txt` is missing, install `fastapi uvicorn pydantic vaderSentiment google-genai apscheduler python-dotenv`)*
4. Create a `.env` file in the `backend` directory and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   *(If you omit this, the app will gracefully fall back to mocked LLM drafts for demonstration purposes).*
5. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Demo Scenarios to Observe

Once running, the dashboard simulates tickets arriving and aging. Watch for these specific edge cases built into the synthetic dataset:
- **The Hidden Fire**: Ticket `TKT-004` is labeled "Low" priority, but the customer is an Enterprise tier and threatening legal action. Watch how the NLP module detects the anger/urgency keywords, applying a massive multiplier that skyrockets the ticket to the top of the queue.
- **The Silent Breacher**: Watch calm, low-priority tickets slowly creep up the queue as they age. When the overall queue load increases, their risk accelerates, demonstrating how volume impacts SLA targets.

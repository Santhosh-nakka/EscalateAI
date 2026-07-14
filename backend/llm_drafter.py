import os
from google import genai

def draft_response(ticket: dict) -> str:
    """
    Drafts a first-response suggestion using Google Gemini API.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "[ERROR] LLM Drafting requires an API key. Please add `GEMINI_API_KEY=your_key` to `backend/.env` to enable live drafting."
        
    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""
        You are an expert customer support agent. Draft a professional, empathetic, and concise 
        first response to the following customer support ticket. 
        
        Ticket Subject: {ticket.get('subject')}
        Ticket Description: {ticket.get('description')}
        Customer Tier: {ticket.get('customer_tier', 'Free')}
        Category: {ticket.get('category')}
        
        Provide only the response text.
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"LLM Error: {e}")
        return f"[ERROR] Failed to generate draft from Gemini API. Details: {str(e)}"

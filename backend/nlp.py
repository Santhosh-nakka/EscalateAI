from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

analyzer = SentimentIntensityAnalyzer()

URGENCY_KEYWORDS = [
    r"\burgent\b", r"\bcritical\b", r"\bdown\b", r"\blawyer\b", 
    r"\brefund\b", r"\basap\b", r"\bimmediately\b", r"losing money", 
    r"\bfailing\b", r"\bbroken\b", r"locked out", r"\bcrashes\b", r"\bcrashes\b"
]

def analyze_ticket_text(text: str) -> dict:
    """
    Analyzes ticket text to calculate sentiment and an NLP-based urgency multiplier.
    Returns a dictionary with sentiment score, matched keywords, and an urgency multiplier.
    """
    # 1. Sentiment Analysis
    sentiment_dict = analyzer.polarity_scores(text)
    compound_score = sentiment_dict['compound']
    
    # 2. Keyword Matching
    matched_keywords = []
    text_lower = text.lower()
    for pattern in URGENCY_KEYWORDS:
        if re.search(pattern, text_lower):
            matched_keywords.append(pattern.replace(r"\b", ""))
            
    # 3. Calculate Urgency Multiplier
    # Base multiplier is 1.0
    urgency_multiplier = 1.0
    
    # If sentiment is highly negative, increase multiplier
    if compound_score < -0.5:
        urgency_multiplier += 0.5
    elif compound_score < -0.2:
        urgency_multiplier += 0.2
        
    # Each urgent keyword adds to the multiplier
    urgency_multiplier += len(matched_keywords) * 0.3
    
    return {
        "sentiment_score": compound_score,
        "matched_keywords": list(set(matched_keywords)),
        "urgency_multiplier": round(urgency_multiplier, 2)
    }

if __name__ == "__main__":
    # Test
    test_text = "Your API is completely down and we are losing thousands of dollars every minute! We need this fixed immediately or we will be talking to our lawyer and demanding a full refund."
    print(analyze_ticket_text(test_text))

from services.gemini_service import evaluate_interview

def process_interview_evaluation(history: list, role: str, company: str) -> dict:
    """
    Wraps the evaluation service to compile and clean interview results.
    Computes additional stats such as total word count and completion details.
    """
    # Run evaluation via Gemini or fallback
    report = evaluate_interview(history, role, company)
    
    # Calculate word count stats locally
    total_words = 0
    question_count = len(history)
    
    for item in history:
        answer = item.get("answer", "")
        total_words += len(answer.split())
        
    # Append calculated metadata to the final report
    report["metadata"] = {
        "total_questions": question_count,
        "total_word_count": total_words,
        "average_word_count_per_answer": round(total_words / question_count, 1) if question_count > 0 else 0,
        "is_sandbox": report.get("score") == 88 and total_words == 0 # Flag mock defaults
    }
    
    return report

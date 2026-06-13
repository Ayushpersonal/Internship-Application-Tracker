import uuid
import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from services.gemini_service import generate_first_question, generate_next_question, transcribe_audio
from services.evaluation_service import process_interview_evaluation

router = APIRouter(prefix="/api/interview", tags=["interview"])

# In-memory session store
# session_id -> { "role": str, "company": str, "resume_skills": str, "history": [ { "question": str, "answer": str }, ... ] }
sessions: Dict[str, dict] = {}

class StartRequest(BaseModel):
    role: str
    company: str
    resume_skills: Optional[str] = ""

class SubmitRequest(BaseModel):
    session_id: str
    answer: Optional[str] = ""
    audio_data: Optional[str] = None

class EvaluateRequest(BaseModel):
    session_id: str

@router.post("/start")
def start_interview(req: StartRequest):
    role = req.role.strip() if req.role else ""
    company = req.company.strip() if req.company else "General Interview"
    
    if not role:
        raise HTTPException(status_code=400, detail="Role name is required")
        
    session_id = str(uuid.uuid4())
    first_q = generate_first_question(role, company, req.resume_skills)
    
    # Store session details
    sessions[session_id] = {
        "role": role,
        "company": company,
        "resume_skills": req.resume_skills.strip() if req.resume_skills else "",
        "history": [
            {"question": first_q, "answer": ""}
        ]
    }
    
    return {
        "session_id": session_id,
        "question": first_q
    }

@router.post("/submit")
def submit_answer(req: SubmitRequest):
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    if not session["history"]:
        raise HTTPException(status_code=400, detail="Session history is corrupted or empty")
        
    ans_text = req.answer.strip() if req.answer else ""
    
    # Handle audio data if present
    if req.audio_data:
        try:
            # Decode the base64 audio URL sent by client
            header, encoded = req.audio_data.split(",", 1)
            audio_bytes = base64.b64decode(encoded)
            # Transcribe the audio bytes to text
            ans_text = transcribe_audio(audio_bytes)
        except Exception as e:
            print(f"Error decoding or transcribing audio payload: {e}")
            ans_text = "Error decoding audio response."

    # Save answer to the current question (the last one in the history list)
    session["history"][-1]["answer"] = ans_text
    
    # Check if we have asked 3 questions (or customize as needed). Let's set interview length to 3 questions max
    MAX_QUESTIONS = 3
    
    if len(session["history"]) >= MAX_QUESTIONS:
        return {
            "question": "Great! You have answered all questions. Click 'View Evaluation' to see your performance.",
            "is_finished": True
        }
        
    # Generate the next question
    # Pass history so the model knows what was asked and answered
    next_q = generate_next_question(
        history=session["history"],
        last_answer=ans_text,
        role=session["role"],
        company=session["company"]
    )
    
    # Append the new question to history with an empty answer
    session["history"].append({"question": next_q, "answer": ""})
    
    return {
        "question": next_q,
        "is_finished": False
    }

@router.post("/evaluate")
def evaluate_session(req: EvaluateRequest):
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    # Filter out items that have no questions or empty history
    history = [item for item in session["history"] if item["question"]]
    if not history:
        raise HTTPException(status_code=400, detail="No questions have been answered yet")
        
    # Remove last question if it wasn't answered
    if history and not history[-1]["answer"]:
        history.pop()
        
    if not history:
        raise HTTPException(status_code=400, detail="No questions have been answered yet")
        
    # Evaluate
    report = process_interview_evaluation(
        history=history,
        role=session["role"],
        company=session["company"]
    )
    
    return report

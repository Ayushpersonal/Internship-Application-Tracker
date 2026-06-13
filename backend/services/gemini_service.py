import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load env variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def is_mock_mode():
    return not GEMINI_API_KEY or GEMINI_API_KEY == "your-api-key"

def call_gemini_api(prompt: str, system_instruction: str = None) -> dict:
    """
    Calls Gemini API via the official google-genai SDK.
    Returns parsed JSON dictionary or raises exception.
    """
    if is_mock_mode():
        raise ValueError("Running in Mock Mode (No valid GEMINI_API_KEY configured)")

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        config = {}
        if system_instruction:
            config["system_instruction"] = system_instruction
        config["response_mime_type"] = "application/json"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(**config)
        )
        
        # Clean up the raw text response in case markdown blocks slipped in
        clean_text = response.text.strip().strip('```json').strip('```')
        return json.loads(clean_text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise e

def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Transcribes audio using Gemini 2.5 Flash.
    """
    if is_mock_mode():
        return "This is a sandbox response transcript because no valid Gemini API key is configured."
        
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type='audio/webm',
                ),
                "Accurately transcribe the spoken content in this audio. Do not add any extra text, comments, or pleasantries. Just return the transcription text."
            ]
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return "Could not transcribe audio due to an API error."

def analyze_filler_words(text: str) -> dict:
    words = text.split()
    total_words = len(words) if len(words) > 0 else 1
    fillers = re.findall(r'\b(um|uh|like|so|basically|actually)\b', text, re.IGNORECASE)
    filler_count = len(fillers)
    filler_ratio = filler_count / total_words
    
    if filler_ratio > 0.12:
        confidence_level = "Low Confidence"
    elif 0.05 < filler_ratio <= 0.12:
        confidence_level = "Medium Confidence"
    else:
        confidence_level = "High Confidence"
        
    return {
        "level": confidence_level,
        "fillerCount": filler_count,
        "ratio": round(filler_ratio, 2)
    }


# MOCK INTERVIEW DATABASE FOR SANDBOX MOCK MODE
MOCK_QUESTIONS = {
    "software engineer": [
        "Can you explain the difference between a process and a thread, and how you would design a rate limiter in a distributed system?",
        "Given a list of strings, how would you design a data structure to efficiently find all strings that share a common prefix, and what is its time complexity?",
        "Tell me about a time when you had to debug a difficult concurrency issue or memory leak in your code. What steps did you take to resolve it?"
    ],
    "frontend developer": [
        "What is the Virtual DOM in React, how does the reconciliation algorithm work in React 19, and when would you use useMemo?",
        "How do you optimize page load performance for a heavy React application, and how do core web vitals like LCP and CLS play into it?",
        "How do you implement responsive design using Vanilla CSS grid and flexbox, and how do you ensure web accessibility (A11y) standards?"
    ],
    "backend engineer": [
        "Explain how database indexing works, the difference between B-Trees and Hash indexes, and how you design a database schema for scale.",
        "How do you handle microservices authentication and authorization securely, and when would you choose REST vs gRPC or GraphQL?",
        "Describe how you would handle high traffic spikes on a REST API endpoint that writes to a relational database."
    ],
    "product manager": [
        "How would you measure the success of the Kanban Tracker in CareerFly, and what metrics would you prioritize for a student-focused SaaS?",
        "Imagine you need to decide between building a new AI code-completion feature or a collaboration tool. How would you prioritize them?",
        "Tell me about a time you had to make a product decision with incomplete or conflicting user analytics data."
    ]
}

DEFAULT_MOCK_QUESTIONS = [
    "Tell me about yourself, your technical background, and what project you are most proud of building.",
    "Describe a challenging technical obstacle you encountered during a project, and how you systematically resolved it.",
    "How do you manage deadlines, prioritize features, and collaborate with team members in an agile development cycle?"
]

MOCK_EVALUATION = {
    "score": 88,
    "strengths": [
        "Clear structural organization of responses using structured lists and details.",
        "Good mention of engineering trade-offs (e.g., memory vs speed trade-offs).",
        "Demonstrated familiarity with modern web tools and modular design."
    ],
    "improvements": [
        "Provide more specific metrics of success (e.g., 'reduced load time by 30%').",
        "Incorporate a wider coverage of security measures in server endpoints.",
        "Describe fallback handling for network request failures in greater depth."
    ],
    "breakdown": [
        {
            "question": "Question 1",
            "answer": "Answer 1",
            "feedback": "Great overview of technologies. Adding more concrete project examples would make the response stronger.",
            "ideal": "An ideal response would briefly outline the project, state the technical stack, highlight a core engineering challenge solved, and state the measurable outcome."
        }
    ]
}

def generate_first_question(role: str, company: str, resume_skills: str) -> str:
    """Generates the first interview question."""
    role_lower = role.lower()
    
    if is_mock_mode():
        # Search mock database
        for key, q_list in MOCK_QUESTIONS.items():
            if key in role_lower:
                return q_list[0]
        return DEFAULT_MOCK_QUESTIONS[0]
        
    system_instruction = (
        "You are an expert technical recruiter conducting a mock job interview. "
        "Your task is to generate the FIRST question of the interview. "
        "Return the output as a valid JSON object matching this schema: "
        "{ \"question\": \"the question text\" }."
    )
    
    prompt = (
        f"Generate the first interview question. The user is applying for the role of '{role}' "
        f"at '{company}'. Here is a summary of their resume and skills: '{resume_skills}'. "
        "Keep the question focused, professional, and technical."
    )
    
    try:
        res = call_gemini_api(prompt, system_instruction)
        return res.get("question", DEFAULT_MOCK_QUESTIONS[0])
    except Exception:
        # Graceful fallback to Mock
        for key, q_list in MOCK_QUESTIONS.items():
            if key in role_lower:
                return q_list[0]
        return DEFAULT_MOCK_QUESTIONS[0]

def generate_next_question(history: list, last_answer: str, role: str, company: str) -> str:
    """Generates the next interview question based on history and user's last answer."""
    question_count = len(history)
    role_lower = role.lower()
    
    if is_mock_mode():
        # Fetch mock questions list
        q_list = DEFAULT_MOCK_QUESTIONS
        for key, mock_qs in MOCK_QUESTIONS.items():
            if key in role_lower:
                q_list = mock_qs
                break
        
        # If we have reached or exceeded mock list length, wrap around or return default
        if question_count < len(q_list):
            return q_list[question_count]
        return "That concludes the questions! Please click 'Submit and View Evaluation' to get your final score."
        
    system_instruction = (
        "You are an expert recruiter conducting a mock interview. "
        "Generate the next question based on the interview history and the user's latest answer. "
        "The question can be a follow-up or explore a new relevant technical area. "
        "Return the output as a valid JSON object matching this schema: "
        "{ \"question\": \"the question text\" }."
    )
    
    formatted_history = "\n".join([
        f"Q: {item['question']}\nA: {item.get('answer', '')}" for item in history
    ])
    
    prompt = (
        f"Generate the next interview question. The user is interviewing for the '{role}' role at '{company}'.\n\n"
        f"Here is the interview history so far:\n{formatted_history}\n\n"
        f"User's latest answer:\n'{last_answer}'\n\n"
        "Generate a relevant next question. If this is question 3 or 4, keep it technical or situational. "
        "Make it direct and concise."
    )
    
    try:
        res = call_gemini_api(prompt, system_instruction)
        return res.get("question", "Could you elaborate more on your project deployment strategies and CI/CD pipelines?")
    except Exception:
        # Fallback to Mock
        q_list = DEFAULT_MOCK_QUESTIONS
        for key, mock_qs in MOCK_QUESTIONS.items():
            if key in role_lower:
                q_list = mock_qs
                break
        if question_count < len(q_list):
            return q_list[question_count]
        return "That concludes the questions! Please click 'Submit and View Evaluation' to get your final score."

def evaluate_interview(history: list, role: str, company: str) -> dict:
    """Evaluates the complete interview history and generates a comprehensive report."""
    if is_mock_mode():
        # Fill in history details dynamically to make it feel customized
        mock_eval = json.loads(json.dumps(MOCK_EVALUATION))
        breakdown = []
        avg_score = 75
        
        # Compute dynamic scores based on length of response to make Mock Mode look realistic
        total_len = 0
        for i, item in enumerate(history):
            ans = item.get("answer", "")
            ans_len = len(ans)
            total_len += ans_len
            
            # Rate response length
            item_score = 65
            if ans_len > 100:
                item_score = 92
            elif ans_len > 40:
                item_score = 82
                
            breakdown.append({
                "question": item["question"],
                "answer": ans,
                "feedback": f"Good answer. Your response length was {ans_len} characters. " + 
                            ("You provided excellent detail." if ans_len > 100 else "Adding more technical depth would improve the impact."),
                "ideal": f"An ideal answer for this question on {role} at {company} would clearly define the term, explain the core concepts step-by-step, discuss any architectural trade-offs (e.g. storage vs speed), and reference practical implementation experience."
            })
            
        calculated_score = min(98, max(50, 70 + (total_len // 25)))
        mock_eval["score"] = calculated_score
        mock_eval["breakdown"] = breakdown
        return mock_eval
        
    system_instruction = (
        "You are an expert technical interviewer. Evaluate the interview history and generate a final report. "
        "Return the output as a valid JSON object matching exactly this schema:\n"
        "{\n"
        "  \"score\": 85, // integer score between 0 and 100\n"
        "  \"strengths\": [\"strength 1\", \"strength 2\", ...],\n"
        "  \"improvements\": [\"improvement 1\", \"improvement 2\", ...],\n"
        "  \"breakdown\": [\n"
        "    {\n"
        "      \"question\": \"original question text\",\n"
        "      \"answer\": \"user response text\",\n"
        "      \"feedback\": \"detailed feedback and critique for this specific answer\",\n"
        "      \"ideal\": \"a detailed example of a perfect response to this question\"\n"
        "    },\n"
        "    ...\n"
        "  ]\n"
        "}"
    )
    
    formatted_history = "\n".join([
        f"Question {i+1}: {item['question']}\nUser Answer: {item.get('answer', '')}\n---" 
        for i, item in enumerate(history)
    ])
    
    prompt = (
        f"Evaluate this mock interview for the role of '{role}' at '{company}'.\n\n"
        f"Interview script:\n{formatted_history}\n\n"
        "Review each answer carefully. Provide constructive, high-quality feedback. "
        "Generate realistic scores and detailed ideal answers."
    )
    
    try:
        return call_gemini_api(prompt, system_instruction)
    except Exception as e:
        print(f"Error calling evaluator Gemini API: {e}. Falling back to dynamic mock evaluation.")
        # Fallback to local dynamic evaluator
        return evaluate_interview(history, role, company)

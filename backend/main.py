import os
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(usecwd=True))

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or "").strip()
if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE" and genai:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Personal Wellbeing AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TutorRequest(BaseModel):
    topic: str

@app.get("/")
def home():
    return {"status": "active", "message": "Backend connected successfully"}

@app.post("/api/tutor")
def generate_tutor_explanation(payload: TutorRequest):
    topic_text = payload.topic.strip()
    
    if not topic_text:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    
    # Check if Gemini is configured
    if not genai or not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        # Fallback explanation if API key is missing
        explanation_content = (
            f"⚠️ **Gemini API Key Missing**\n\n"
            f"Please configure your `GEMINI_API_KEY` in the backend `.env` file to unlock real-time explanations for **{topic_text}**."
        )
    else:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"You are an expert AI Tutor. The user is asking about or taking action on the topic: '{topic_text}'. "
                f"Provide a clear, educational, and structured explanation. Use markdown with bullet points and bold text where appropriate."
            )
            response = model.generate_content(prompt)
            explanation_content = response.text.strip()
        except Exception as e:
            print(f"Gemini API Error: {e}")
            explanation_content = (
                f"⚠️ **Error generating response**\n\n"
                f"Could not fetch AI response for **{topic_text}**. Please try again later or check your API key constraints."
            )
    
    return {
        "status": "success",
        "topic": topic_text,
        "explanation": explanation_content
    }
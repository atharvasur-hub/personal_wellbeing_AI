from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Personal Wellbeing AI Backend", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TutorRequest(BaseModel):
    topic: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "Personal Wellbeing AI Backend is running successfully."}

@app.post("/api/tutor")
def ai_tutor(req: TutorRequest):
    topic_name = req.topic.strip()
    
    if not topic_name:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    
    # Clean structured breakdown response tailored for your hackathon presentation
    explanation = (
        f"### Breakdown of **{topic_name}**\n\n"
        f"1. **Core Definition**: {topic_name} is a fundamental concept designed to solve complex structural or logical challenges efficiently.\n"
        f"2. **Key Components**: \n"
        f"   - Principle structure and initial setup.\n"
        f"   - Execution flow and state handling.\n"
        f"   - Error management and optimization.\n"
        f"3. **Practical Real-World Example**: Think of it like organizing a system pipeline where inputs are automatically validated, processed sequentially, and outputted securely."
    )
    
    return {
        "success": True,
        "topic": topic_name,
        "explanation": explanation
    }
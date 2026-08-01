from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
def read_root():
    return {"status": "online", "message": "Personal Wellbeing AI Backend is running successfully."}

@app.post("/api/tutor")
def ai_tutor(req: TutorRequest):
    topic_name = req.topic.strip()
    
    if not topic_name:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    
    # Dynamically injects whatever topic you type into the response text
    explanation = (
        f"### Breakdown of **{topic_name}**\n\n"
        f"1. **Core Definition**: {topic_name} is a powerful technology/concept used to build scalable systems, write efficient logic, and solve computational problems.\n"
        f"2. **Key Components**: \n"
        f"   - Syntax, structure, and foundational rules of {topic_name}.\n"
        f"   - Best practices for writing clean and maintainable code.\n"
        f"   - Common debugging patterns and performance optimization.\n"
        f"3. **Practical Application**: You use {topic_name} when developing robust software solutions, managing data structures, or structuring application logic from scratch."
    )
    
    return {
        "success": True,
        "topic": topic_name,
        "explanation": explanation
    }
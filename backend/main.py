from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

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
    return {"status": "active"}

@app.post("/api/tutor")
def tutor_endpoint(payload: TutorRequest):
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")
    
    return {
        "explanation": f"### Overview of **{topic}**\n\n1. **Core Concept**: {topic} is a key architectural component used to manage state, structure logic, and streamline execution.\n2. **Best Practices**: Ensure proper error handling, modular design, and clean separation of concerns."
    }
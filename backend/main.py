"""
=============================================================
 SYNAPSE AI — FastAPI Backend Engine
 Sole Backend for ML Models, Data Curation, Habit Steering,
 User Persistence & Auth Services
=============================================================

SETUP:
  1. pip install fastapi uvicorn google-generativeai supabase python-dotenv pydantic

RUN:
  cd backend && uvicorn main:app --reload --port 8000

API DOCS:
  http://localhost:8000/docs
=============================================================
"""

import os
import sqlite3
import json
import time
import urllib.request
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field

try:
    from google import genai
except ImportError:
    genai = None

# ── Load environment variables ────────────────────────────────
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(usecwd=True))

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or "").strip()
gemini_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE" and genai:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

SUPABASE_URL   = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY   = os.getenv("SUPABASE_SERVICE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")

# ── Configure Gemini Multi-Model Generator ─────────────────────
def _generate_gemini(prompt: str) -> str:
    """Fresh clean implementation using new google-genai SDK or direct REST fallback."""
    key = (os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or "").strip().replace('"', '').replace("'", "")
    if not key or key == "YOUR_GEMINI_API_KEY_HERE":
        return ""

    # 1. New Google GenAI SDK approach
    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            if response.text:
                return response.text.strip()
        except Exception as e:
            print(f"[FastAPI Gemini] SDK Error: {e}")

    # 2. Clean REST API fallback
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
        payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        print(f"[FastAPI Gemini] REST Error: {e}")

    return ""

gemini_configured = bool(GEMINI_API_KEY)

# ── Configure Supabase (Server-Side Client) ───────────────────
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and "your-supabase" not in SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[FastAPI] Supabase init warning: {e}")
        supabase_client = None

# ── Local In-Memory Fallback Database ──────────────────────────
in_memory_db: Dict[str, Any] = {
    "chat_messages": [],
    "user_aspirations": [],
    "habit_steering_logs": [],
    "focus_sessions": [],
    "reflections": [],
    "users": [
        {
            "id": "usr_default",
            "email": "atharva@synapse.ai",
            "password": "password123",
            "name": "Atharva Sur",
            "role": "Growth Catalyst • Tier 3"
        }
    ],
    "user_profiles": {},
    "user_deep_skills": {},
    "failed_concepts": {}
}

def _get_failed_concepts(user_id: str) -> List[str]:
    if "failed_concepts" not in in_memory_db:
        in_memory_db["failed_concepts"] = {}
    return in_memory_db["failed_concepts"].setdefault(user_id, [])

def _add_failed_concept(user_id: str, concept: str):
    concepts = _get_failed_concepts(user_id)
    if concept not in concepts:
        concepts.append(concept)

def _remove_failed_concept(user_id: str, concept: str):
    concepts = _get_failed_concepts(user_id)
    if concept in concepts:
        try:
            concepts.remove(concept)
        except ValueError:
            pass



# ── FastAPI App Configuration ────────────────────────────────
app = FastAPI(
    title="Synapse AI — Complete FastAPI Backend",
    description="Unified backend providing AI Chat, ML Recommendations, Digital Guardian, Focus Tracking, and User State Management.",
    version="2.0.0",
)

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

# --- 1. Database Setup ---
# This creates a local file named 'users.db' and builds the table if it doesn't exist
def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS community_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            community_id TEXT,
            sender_id TEXT,
            sender_name TEXT,
            role TEXT,
            text TEXT,
            is_announcement INTEGER DEFAULT 0,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

# ═══════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ═══════════════════════════════════════════════════════════════

class PointsAwardRequest(BaseModel):
    user_id: str
    action_type: str
    points: int

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []
    user_id: Optional[str] = "usr_default"

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []

class GoalRequest(BaseModel):
    goal: str
    mood: Optional[str] = "focused"
    user_id: Optional[str] = "usr_default"

class ContentItem(BaseModel):
    type: str          # "video" | "short" | "reel" | "article" | "podcast" | "speech"
    title: str
    youtube_id: str    # empty string for articles
    url: str
    duration: str
    reason: str
    signal_score: int
    is_gap_fix: Optional[bool] = False
    content_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    source_url: Optional[str] = None


class RecommendationResponse(BaseModel):
    goal: str
    items: List[ContentItem]
    intent_domain: str

class HabitCheckRequest(BaseModel):
    activity: str
    duration_minutes: int
    user_id: Optional[str] = "usr_default"

class HabitCheckResponse(BaseModel):
    intercept_required: bool
    reason: Optional[str] = None
    redirect_suggestion: Optional[str] = None
    time_saved_minutes: Optional[int] = None

class HabitLogRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    intercept_trigger: str
    time_saved_minutes: int
    redirected_sprint: str
    user_accepted: bool = True

class AspirationRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    aspiration: str
    target_timeline: Optional[str] = "6 Months"
    current_level: Optional[str] = "Intermediate"

class FocusSessionRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    task_name: str
    duration_minutes: int
    distractions_blocked: int = 0
    completed_at: Optional[str] = None

class ReflectionRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    mood: str
    log_text: str

class AuthRegisterRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = "Atharva Sur"

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class UserProfileData(BaseModel):
    user_id: Optional[str] = "usr_default"
    name: Optional[str] = "Atharva Sur"
    role: Optional[str] = "Growth Catalyst • Tier 3"
    aspiration: Optional[str] = "Senior AI Architect"
    email: Optional[str] = "atharva@synapse.ai"
    streak: Optional[str] = "4-Day Focus Streak"
    level: Optional[str] = "14"
    xp: Optional[str] = "3,420"
    focus_time: Optional[str] = "2h 15m"
    skills_verified: Optional[str] = "12 Concepts"
    goal_velocity: Optional[str] = "84%"
    vpm_index: Optional[str] = "$4.82/min"


class OnboardingRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    name: Optional[str] = "User"
    current_role: str
    future_goal: str
    timeline: Optional[str] = "6 Months"
    skills: List[str] = []
    condition: Optional[str] = "Deep Skill Focus"

class Milestone(BaseModel):
    phase: str
    duration: str

class OnboardingAssessRequest(BaseModel):
    baseline: str
    aspiration: str
    timeframe: str
    user_id: Optional[str] = "usr_default"

class OnboardingAssessResponse(BaseModel):
    condition_vector: str
    target_vector: str
    roadmap: List[Milestone]
    initial_feed_topics: List[str]

class RoadmapRequest(BaseModel):
    aspiration: str
    user_id: Optional[str] = "usr_default"

class RoadmapNodeItem(BaseModel):
    id: str
    title: str
    subtitle: str
    type: str
    duration_mins: int
    status: str
    description: str



# ═══════════════════════════════════════════════════════════════
# 1. CHATBOT & HISTORY ENDPOINTS
# ═══════════════════════════════════════════════════════════════

CHAT_SYSTEM_PROMPT = """
You are Synapse AI — an elite personal growth and wellbeing AI assistant.
Your role is to help the user achieve their goals, improve focus, manage habits, and accelerate learning.
Tone: supportive, precise, motivating, and high-tech.
Keep responses concise (3-5 sentences max unless the user asks for detail).
Always tie your advice directly to the user's stated goals and wellbeing.
""".strip()

def _get_user_profile_context(user_id: str) -> str:
    profile = in_memory_db["user_profiles"].get(user_id)
    deep_skill = in_memory_db["user_deep_skills"].get(user_id)
    
    name = profile.get("name") if profile else None
    role = profile.get("role") if profile else None
    aspiration = profile.get("aspiration") if profile else None
    skills = deep_skill.get("skills") if deep_skill else None
    condition = deep_skill.get("condition") if deep_skill else None

    # Fallback to defaults
    if not name or not role or not aspiration:
        name = name or "Atharva Sur"
        role = role or "Growth Catalyst • Tier 3"
        aspiration = aspiration or "Senior AI Architect"
    
    skills_str = ", ".join(skills) if skills else "Systems Architecture, Deep Work Endurance, AI Alignment & Safety"
    condition_str = condition or "Deep Skill Focus"
    
    context = (
        f"User Session Information:\n"
        f"- Name: {name}\n"
        f"- Current Role: {role}\n"
        f"- Career Goal/Aspiration: {aspiration}\n"
        f"- Target Skills: {skills_str}\n"
        f"- Current Condition: {condition_str}\n\n"
        f"IMPORTANT GUIDANCE RULES FOR SYNAPSE AI:\n"
        f"1. You are the 'brain' of the project. You must actively guide the user to bridge the gap between their current role ({role}) and their career goal ({aspiration}).\n"
        f"2. Tailor your responses to focus on their target skills ({skills_str}).\n"
        f"3. Incorporate their energy state/condition ({condition_str}) into recommendations. If they are burned out or seeking balance, advise recovery or time-boxing. If they are in deep focus, suggest intense, structured study sprints.\n"
        f"4. Proactively prompt them with micro-steps they can take today to move closer to their goal."
    )
    return context


import re

def _generate_smart_fallback(user_message: str) -> Dict[str, Any]:
    msg = user_message.strip()

    def has_word(word: str) -> bool:
        return bool(re.search(r'\b' + re.escape(word) + r'\b', msg, re.IGNORECASE))

    if has_word('java') and not has_word('javascript'):
        return {
            "text": "☕ **Java Core & Enterprise Architecture:**\n\n```java\n// Object-Oriented Java Fundamentals\npublic class LearningTask {\n    private String title;\n    private boolean completed;\n\n    public LearningTask(String title) {\n        this.title = title;\n        this.completed = false;\n    }\n\n    public static void main(String[] args) {\n        LearningTask task = new LearningTask(\"Master Java OOP & JVM\");\n        System.out.println(task.title);\n    }\n}\n```\n\n1. **OOP Core:** Encapsulation, Inheritance, Polymorphism, Abstraction.\n2. **JVM & Memory:** Heap vs Stack, Garbage Collection tuning.\n3. **Enterprise Stack:** Spring Boot, REST APIs & JPA/Hibernate.",
            "suggestions": ['Java OOP Concepts', 'Spring Boot Setup', 'JVM Memory Tuning']
        }

    if any(has_word(w) for w in ['python', 'pip', 'django', 'fastapi', 'flask']):
        return {
            "text": "🐍 **Python Backend & Architecture Blueprint:**\n\n```python\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI(title=\"Synapse AI API\")\n\nclass SkillGoal(BaseModel):\n    title: str\n    timeframe: str = \"6 months\"\n\n@app.post(\"/api/goal\")\nasync def create_goal(goal: SkillGoal):\n    return {\"status\": \"success\", \"goal\": goal.title}\n```\n\n1. **Async Engine:** `asyncio` event loops & non-blocking I/O.\n2. **Type Safety:** Pydantic models & type annotations.\n3. **ORM & Storage:** Supabase PostgreSQL & Redis caching.",
            "suggestions": ['FastAPI Setup', 'Async Python', 'Database Schemas']
        }

    if any(has_word(w) for w in ['react', 'frontend', 'component', 'hook', 'javascript', 'js']):
        return {
            "text": "⚡ **React & Modern Web Architecture:**\n\n```jsx\nimport React, { useState } from 'react';\n\nexport default function SkillTracker({ title }) {\n  const [completed, setCompleted] = useState(false);\n  return (\n    <button onClick={() => setCompleted(!completed)}>\n      {title}: {completed ? '✓ Done' : 'In Progress'}\n    </button>\n  );\n}\n```\n\n1. **State Hygiene:** `useState`, `useReducer`, and `useMemo` for render optimization.\n2. **Hooks Lifecycle:** Clean `useEffect` cleanup handlers.\n3. **UI Engine:** Tailwind CSS & Glassmorphic design systems.",
            "suggestions": ['React Performance', 'Custom Hooks', 'Tailwind Layout']
        }

    if any(has_word(w) for w in ['ml', 'ai', 'pytorch', 'tensorflow', 'llm', 'rag']):
        return {
            "text": "🎯 **AI & Deep Learning Pathway:**\n\n```python\nimport torch\nimport torch.nn as nn\n\nclass ResidualBlock(nn.Module):\n    def __init__(self, channels):\n        super().__init__()\n        self.conv = nn.Conv2d(channels, channels, 3, padding=1)\n    def forward(self, x):\n        return x + self.conv(x)\n```\n\n1. **Foundations:** Tensor linear algebra & Autograd backpropagation.\n2. **Retrieval (RAG):** Vector embeddings, cosine similarity & Pinecone/Supabase vector.\n3. **Model Ops:** Quantization, ONNX export & FastAPI inference endpoints.",
            "suggestions": ['PyTorch Tutorial', 'RAG Architecture', 'LLM Fine-Tuning']
        }

    return {
        "text": f"Greetings! I am your Synapse AI Growth Architect.\n\nRegarding **\"{user_message}\"**:\n\n1. **Target Milestone:** Deconstruct this into core domain concepts and 25-minute practice sprints.\n2. **Focused Execution:** Launch a 25-minute Focus Sprint to make immediate progress.\n3. **Feedback Loop:** Check your Journey Map and Identity Graph to track skill retention.",
        "suggestions": ['Analyze Aspiration Gap', 'Generate Focus Sprint', 'Open Journey Map']
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Chatbot endpoint — powered by Gemini 2.0 Flash / 1.5 Flash."""
    user_id = req.user_id or "usr_default"

    # Get user profile context to guide the user towards their goal
    profile_context = _get_user_profile_context(user_id)

    context = "\n".join(
        f"{'User' if m.get('role') == 'user' else 'Synapse AI'}: {m.get('text') or m.get('content', '')}"
        for m in req.history[-6:]
    )
    prompt = f"{CHAT_SYSTEM_PROMPT}\n\n{profile_context}\n\n"
    if context:
        prompt += f"Conversation context:\n{context}\n\n"
    prompt += f"User: {req.message}\nSynapse AI:"

    reply_text = _generate_gemini(prompt)

    if not reply_text:
        fallback = _generate_smart_fallback(req.message)
        reply_text = fallback["text"]
        suggestions = fallback["suggestions"]
    else:
        suggestions = _build_suggestions(req.message)

    _record_chat_message(user_id, "user", req.message)
    _record_chat_message(user_id, "assistant", reply_text, suggestions)

    return ChatResponse(reply=reply_text, suggestions=suggestions)


@app.get("/api/chat/history")
async def get_chat_history(user_id: Optional[str] = "usr_default"):
    """Fetch stored chat history for a user."""
    if supabase_client:
        try:
            res = supabase_client.table("chat_messages").select("*").eq("user_id", user_id).order("created_at").execute()
            if res.data:
                return {"messages": res.data}
        except Exception:
            pass

    user_msgs = [m for m in in_memory_db["chat_messages"] if m.get("user_id") == user_id]
    return {"messages": user_msgs}


@app.delete("/api/chat/history")
async def clear_chat_history(user_id: Optional[str] = "usr_default"):
    """Clear chat conversation history."""
    if supabase_client:
        try:
            supabase_client.table("chat_messages").delete().eq("user_id", user_id).execute()
        except Exception:
            pass

    in_memory_db["chat_messages"] = [m for m in in_memory_db["chat_messages"] if m.get("user_id") != user_id]
    return {"status": "success", "message": "Chat history cleared"}


def _record_chat_message(user_id: str, role: str, text: str, suggestions: List[str] = []):
    msg_obj = {
        "user_id": user_id,
        "role": role,
        "text": text,
        "suggestions": suggestions,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    in_memory_db["chat_messages"].append(msg_obj)
    if supabase_client:
        try:
            supabase_client.table("chat_messages").insert(msg_obj).execute()
        except Exception:
            pass


# ═══════════════════════════════════════════════════════════════
# 2. GOAL-BASED ML RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend(req: GoalRequest):
    """ML Content Curation — returns 4 items (Video, Short, Reel, Article) for a goal."""
    intent = _analyze_intent(req.goal)
    user_id = req.user_id or "usr_default"
    failed_concepts = _get_failed_concepts(user_id)

    try:
        items = await _gemini_recommendations(req.goal, failed_concepts)
        if items:
            return RecommendationResponse(goal=req.goal, items=items, intent_domain=intent["domain"])
    except Exception as e:
        print(f"[FastAPI] Gemini recommendations error: {e}")
        pass

    items = _static_recommendations(req.goal, failed_concepts)
    return RecommendationResponse(goal=req.goal, items=items, intent_domain=intent["domain"])


async def _gemini_recommendations(goal: str, failed_concepts: List[str] = []) -> List[ContentItem]:
    gap_instruction = ""
    if failed_concepts:
        concepts_str = ", ".join(failed_concepts)
        gap_instruction = f'\nYou are an adaptive learning curator. The user recently struggled with the following concepts: {concepts_str}. You MUST prioritize and generate content cards specifically targeting these exact blind spots before recommending any general content. Tag the returned JSON object with `is_gap_fix: true`.'

    prompt = f"""
You are an expert learning curator AI. A user has stated this goal: "{goal}"
{gap_instruction}

Return ONLY a valid JSON array with exactly 4 objects. No markdown, no extra text. Each object:
- "type": one of "video", "podcast", "speech", "article"
- "content_type": same as type ("video", "podcast", "speech", "article")
- "title": descriptive title (for speech, make this an inspiring quote)
- "youtube_id": REAL 11-char YouTube video ID (empty string "" for non-videos)
- "url": full URL to the resource
- "source_url": direct URL to media (for podcast, use "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
- "thumbnail_url": URL to cover image (optional)
- "duration": e.g. "12 min" or "60 sec" or "8 min read"
- "reason": one sentence starting with "Why: " explaining relevance to the goal
- "signal_score": integer 90-99
- "is_gap_fix": boolean (true if this card specifically targets the failed concepts/blind spots, false otherwise)

Rules:
1. Item 1 = type "podcast" (30-60 min deep dive discussion)
2. Item 2 = type "speech" (motivational or educational keynote)
3. Item 3 = type "video" (5-20 min full YouTube tutorial)
4. Item 4 = type "article" (high-quality article, youtube_id must be "")
Return ONLY the JSON array.
""".strip()

    raw_text = _generate_gemini(prompt)
    if not raw_text:
        return []

    raw = raw_text.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(raw)

    return [
        ContentItem(
            type=item.get("type", "video"),
            title=item.get("title", ""),
            youtube_id=item.get("youtube_id", ""),
            url=item.get("url", ""),
            duration=item.get("duration", ""),
            reason=item.get("reason", ""),
            signal_score=item.get("signal_score", 95),
            is_gap_fix=item.get("is_gap_fix", False)
        )
        for item in parsed[:4]
    ]


def _static_recommendations(goal: str, failed_concepts: List[str] = []) -> List[ContentItem]:
    is_gap = len(failed_concepts) > 0
    concepts_str = f" [{', '.join(failed_concepts)}]" if is_gap else ""
    g = goal.lower()
    
    if any(k in g for k in ["react", "hooks", "frontend", "javascript"]):
        return [
            ContentItem(
                type="podcast",
                content_type="podcast",
                title=f"React Architecture Podcast{concepts_str}",
                youtube_id="",
                url="https://react.dev",
                source_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                thumbnail_url="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=200",
                duration="45 min",
                reason=f"Why: Targeted review for your struggle with {', '.join(failed_concepts)}." if is_gap else "Why: Deep dive discussion on complex state management in React apps.",
                signal_score=98,
                is_gap_fix=is_gap
            ),
            ContentItem(
                type="speech",
                content_type="speech",
                title="The future belongs to those who learn more skills and combine them in creative ways.",
                youtube_id="",
                url="#",
                duration="5 min read",
                reason="Why: A motivational reminder to push through the frustration of learning complex state paradigms.",
                signal_score=96,
                is_gap_fix=False
            ),
            ContentItem(
                type="reel",
                title="React Reconciler Algorithm Visualised",
                youtube_id="TNhaISOUy6Q",
                url="https://www.youtube.com/watch?v=TNhaISOUy6Q",
                duration="45 sec",
                reason="Why: High-retention animation of React diffing — low cognitive load.",
                signal_score=95,
                is_gap_fix=False
            ),
            ContentItem(
                type="article",
                title=f"React State Management & Hooks Guide",
                youtube_id="",
                url="https://overreacted.io/a-complete-guide-to-useeffect/",
                duration="8 min read",
                reason=f"Why: Hand-picked to address your knowledge gap in {', '.join(failed_concepts)}." if is_gap else "Why: The gold standard deep-dive article — foundational mental model.",
                signal_score=94,
                is_gap_fix=is_gap
            ),
        ]
        
    if any(k in g for k in ["machine learning", "ml", "neural", "python", "ai", "deep learning"]):
        return [
            ContentItem(
                type="video",
                title=f"Neural Networks from Scratch{concepts_str} – Karpathy",
                youtube_id="VMj-3S1tku0",
                url="https://www.youtube.com/watch?v=VMj-3S1tku0",
                duration="25 min",
                reason=f"Why: World-class backpropagation walkthrough targeted for your struggle with {', '.join(failed_concepts)}." if is_gap else "Why: World-class backpropagation walkthrough from Andrej Karpathy — ideal for your ML goal.",
                signal_score=98,
                is_gap_fix=is_gap
            ),
            ContentItem(
                type="short",
                title="Gradient Descent in 60 Seconds",
                youtube_id="IHZwWFHWa-w",
                url="https://www.youtube.com/shorts/IHZwWFHWa-w",
                duration="60 sec",
                reason="Why: Instant gradient descent mental model — quick review before deeper practice.",
                signal_score=96,
                is_gap_fix=False
            ),
            ContentItem(
                type="reel",
                title="How a Neural Network Learns (Animated)",
                youtube_id="aircAruvnKk",
                url="https://www.youtube.com/watch?v=aircAruvnKk",
                duration="45 sec",
                reason="Why: Stunning visual of neural net weight updates — excellent visual recall.",
                signal_score=95,
                is_gap_fix=False
            ),
            ContentItem(
                type="article",
                title=f"Attention mechanisms & Transformers Guide",
                youtube_id="",
                url="https://jalammar.github.io/illustrated-transformer/",
                duration="12 min read",
                reason=f"Why: The best single article for understanding attention mechanisms, targeting {', '.join(failed_concepts)}." if is_gap else "Why: The best single article for understanding attention mechanisms.",
                signal_score=94,
                is_gap_fix=is_gap
            ),
        ]
        
    return [
        ContentItem(
            type="video",
            title=f"Deep Work – Achieve Peak Performance{concepts_str}",
            youtube_id="gTaJhjQHcf8",
            url="https://www.youtube.com/watch?v=gTaJhjQHcf8",
            duration="14 min",
            reason=f"Why: Cal Newport deep work framework targeted for your struggle with {', '.join(failed_concepts)}." if is_gap else "Why: Cal Newport deep work framework — directly boosts ability to reach your goal.",
            signal_score=98,
            is_gap_fix=is_gap
        ),
        ContentItem(
            type="short",
            title="The 5-Second Rule in 60 Seconds",
            youtube_id="k2TaFVANNTg",
            url="https://www.youtube.com/shorts/k2TaFVANNTg",
            duration="60 sec",
            reason="Why: Instant motivation trigger — activates momentum toward your goal.",
            signal_score=96,
            is_gap_fix=False
        ),
        ContentItem(
            type="reel",
            title="Flow State Activation – Get Deep Focus",
            youtube_id="QkOCbt_o2HY",
            url="https://www.youtube.com/watch?v=QkOCbt_o2HY",
            duration="45 sec",
            reason="Why: Primes your brain for high-yield learning sessions.",
            signal_score=95,
            is_gap_fix=False
        ),
        ContentItem(
            type="article",
            title="The Feynman Technique – Learn Anything",
            youtube_id="",
            url="https://fs.blog/feynman-technique/",
            duration="6 min read",
            reason=f"Why: Explains through teaching to lock in understanding, targeting your struggle with {', '.join(failed_concepts)}." if is_gap else "Why: The best learning strategy — explains through teaching to lock in understanding.",
            signal_score=94,
            is_gap_fix=is_gap
        ),
    ]


@app.post("/api/roadmap")
async def generate_roadmap(req: RoadmapRequest):
    """Generate a dynamic 5-node skill roadmap for a target career aspiration."""
    aspiration = req.aspiration or "AI Engineer"

    prompt = f"""
You are an expert AI Career Architect. Create a structured 5-milestone learning roadmap to help someone achieve this goal/role: "{aspiration}".

Return ONLY a valid JSON array of 5 objects. No markdown formatting.
Each object:
- "id": string e.g. "node-1", "node-2", "node-3", "node-4", "node-5"
- "title": milestone title (max 8 words)
- "subtitle": phase subtitle e.g. "Phase 1 • Foundational Skills"
- "type": content/activity type e.g. "Video Tutorial", "Focus Sprint", "Interactive AI Feed", "Deep Dive Article", "Performance Audit"
- "duration_mins": integer e.g. 15, 25, 10, 45, 20
- "status": string ("completed" for node 1-2, "active" for node 3, "locked" for node 4-5)
- "description": 1 concise sentence describing what the user learns or achieves at this stage.

Return ONLY the JSON array.
""".strip()

    raw_text = _generate_gemini(prompt)
    if raw_text:
        try:
            raw = raw_text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(raw)
            if len(parsed) >= 5:
                return {"aspiration": aspiration, "nodes": parsed[:5]}
        except Exception:
            pass

    # Static fallback roadmap generator
    role_clean = aspiration.replace("I want to become a", "").replace("I want to be a", "").strip().title()
    fallback_nodes = [
        {
            "id": "node-1",
            "title": f"Foundational {role_clean} Fundamentals",
            "subtitle": "Phase 1 • Orientation",
            "type": "Video Tutorial",
            "duration_mins": 15,
            "status": "completed",
            "description": f"Master basic mental models and prerequisites for becoming a {role_clean}."
        },
        {
            "id": "node-2",
            "title": f"Core {role_clean} Tooling & Practice",
            "subtitle": "Phase 2 • Hands-on Sprint",
            "type": "Focus Sprint",
            "duration_mins": 25,
            "status": "completed",
            "description": f"Build hands-on practice projects with key framework tools."
        },
        {
            "id": "node-3",
            "title": f"Advanced {role_clean} System Integration",
            "subtitle": "Phase 3 • Active Journey Node",
            "type": "Interactive AI Feed",
            "duration_mins": 10,
            "status": "active",
            "description": f"Integrate complex components and consume curated AI media feed."
        },
        {
            "id": "node-4",
            "title": f"Production Scaling & Edge-Case Architecture",
            "subtitle": "Phase 4 • Locked Skill Matrix",
            "type": "Deep Dive Article",
            "duration_mins": 45,
            "status": "locked",
            "description": f"Optimize system performance, security benchmarks, and reliability."
        },
        {
            "id": "node-5",
            "title": f"Senior {role_clean} Portfolio Audit",
            "subtitle": "Phase 5 • Final Calibration",
            "type": "Performance Audit",
            "duration_mins": 20,
            "status": "locked",
            "description": f"Verify 10/10 node mastery and benchmark Value Per Minute index."
        }
    ]
    return {"aspiration": aspiration, "nodes": fallback_nodes}


# ═══════════════════════════════════════════════════════════════
# 3. HABIT STEERING & DIGITAL GUARDIAN
# ═══════════════════════════════════════════════════════════════

@app.post("/api/habit-check", response_model=HabitCheckResponse)
async def habit_check(req: HabitCheckRequest):
    """Digital Guardian — intercepts time-wasting patterns."""
    time_wasting = ["twitter", "x.com", "instagram", "tiktok", "youtube shorts", "scroll", "reddit", "facebook"]
    is_wasting = any(k in req.activity.lower() for k in time_wasting)

    if is_wasting and req.duration_minutes >= 10:
        redirect = f"Redirect {req.duration_minutes} mins from '{req.activity}' to a Focus Sprint"
        log_obj = {
            "user_id": req.user_id or "usr_default",
            "intercept_trigger": req.activity,
            "time_saved_minutes": req.duration_minutes,
            "redirected_sprint": redirect,
            "user_accepted": True,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        in_memory_db["habit_steering_logs"].append(log_obj)

        if supabase_client:
            try:
                supabase_client.table("habit_steering_logs").insert(log_obj).execute()
            except Exception:
                pass

        return HabitCheckResponse(
            intercept_required=True,
            reason=f"Passive scrolling on '{req.activity}' detected for {req.duration_minutes} minutes.",
            redirect_suggestion=redirect,
            time_saved_minutes=req.duration_minutes
        )

    return HabitCheckResponse(intercept_required=False)


@app.post("/api/habit-logs")
async def save_habit_log(req: HabitLogRequest):
    """Store a habit steering log event."""
    log_obj = {
        "user_id": req.user_id or "usr_default",
        "intercept_trigger": req.intercept_trigger,
        "time_saved_minutes": req.time_saved_minutes,
        "redirected_sprint": req.redirected_sprint,
        "user_accepted": req.user_accepted,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    in_memory_db["habit_steering_logs"].append(log_obj)

    if supabase_client:
        try:
            res = supabase_client.table("habit_steering_logs").insert(log_obj).execute()
            if res.data:
                return {"status": "success", "data": res.data}
        except Exception:
            pass

    return {"status": "success", "data": [log_obj]}


@app.get("/api/habit-logs")
async def get_habit_logs(user_id: Optional[str] = "usr_default"):
    """Retrieve saved habit steering logs."""
    if supabase_client:
        try:
            res = supabase_client.table("habit_steering_logs").select("*").eq("user_id", user_id).execute()
            if res.data:
                return {"logs": res.data}
        except Exception:
            pass

    user_logs = [l for l in in_memory_db["habit_steering_logs"] if l.get("user_id") == user_id]
    return {"logs": user_logs}


# ═══════════════════════════════════════════════════════════════
# 4. INTENT ANALYSIS
# ═══════════════════════════════════════════════════════════════

@app.post("/api/analyze-intent")
async def analyze_intent(req: GoalRequest):
    """Extract domain, energy score, and focus priority."""
    intent = _analyze_intent(req.goal)
    intent["mood"] = req.mood
    return intent


class RoadmapRequest(BaseModel):
    aspiration: Optional[str] = "Senior AI Architect"
    topics: Optional[List[str]] = []
    user_id: Optional[str] = "usr_default"


def _build_dynamic_roadmap_nodes(aspiration: str, topics: List[str] = None) -> List[dict]:
    role = (aspiration or "Senior AI Architect").replace("I want to become a ", "").replace("I want to be a ", "").strip()
    if not role:
        role = "Senior AI Architect"
    role_lower = role.lower()
    
    # 1. Python / Backend Engineer
    if any(k in role_lower for k in ["python", "backend", "fastapi", "django"]):
        return [
            {
                "id": "node-1",
                "title": "Python Async & Type System Foundation",
                "subtitle": "Phase 1 • Orientation",
                "type": "Video Tutorial",
                "duration_mins": 20,
                "status": "completed",
                "description": f"Master asyncio event loops, Pydantic schemas, and type hinting for {role} baseline."
            },
            {
                "id": "node-2",
                "title": "FastAPI REST & Middleware Architecture",
                "subtitle": "Phase 2 • Focus Sprint Check-in",
                "type": "Focus Sprint",
                "duration_mins": 30,
                "status": "completed",
                "description": "Build non-blocking REST endpoints with custom CORS, dependency injection, and JWT security."
            },
            {
                "id": "node-3",
                "title": "PostgreSQL & Supabase Database Optimization",
                "subtitle": "Phase 3 • Active Journey Node",
                "type": "Interactive AI Feed",
                "duration_mins": 25,
                "status": "active",
                "description": "Design relational schemas, composite B-tree indexing, and query ORM connection pooling."
            },
            {
                "id": "node-4",
                "title": "Microservices, Caching & Redis Integration",
                "subtitle": "Phase 4 • System Architecture",
                "type": "Deep Dive Article",
                "duration_mins": 45,
                "status": "locked",
                "description": "Implement Redis read-through caching, rate-limiting algorithms, and pub/sub queue patterns."
            },
            {
                "id": "node-5",
                "title": f"Mastery Verification & {role} Audit",
                "subtitle": "Phase 5 • Final Calibration",
                "type": "Performance Audit",
                "duration_mins": 20,
                "status": "locked",
                "description": f"Execute 10/10 node verification audit and benchmark VPM productivity for {role}."
            }
        ]

    # 2. React / Frontend Engineer
    elif any(k in role_lower for k in ["react", "frontend", "javascript", "ui", "ux", "web"]):
        return [
            {
                "id": "node-1",
                "title": "Modern React & Component Lifecycle Baseline",
                "subtitle": "Phase 1 • Orientation",
                "type": "Video Tutorial",
                "duration_mins": 15,
                "status": "completed",
                "description": "Master functional components, props contracts, and strict state immutability."
            },
            {
                "id": "node-2",
                "title": "State Hygiene & Custom React Hooks",
                "subtitle": "Phase 2 • Focus Sprint Check-in",
                "type": "Focus Sprint",
                "duration_mins": 25,
                "status": "completed",
                "description": "Optimize component renders using useCallback, useMemo, and custom reusable hook abstractions."
            },
            {
                "id": "node-3",
                "title": "Tailwind Design Systems & Glassmorphism UI",
                "subtitle": "Phase 3 • Active Journey Node",
                "type": "Interactive AI Feed",
                "duration_mins": 20,
                "status": "active",
                "description": "Build high-signal responsive dashboards with dark modes, CSS grid, and micro-animations."
            },
            {
                "id": "node-4",
                "title": "Single Page Routing, State Management & Vite",
                "subtitle": "Phase 4 • Frontend Architecture",
                "type": "Deep Dive Article",
                "duration_mins": 40,
                "status": "locked",
                "description": "Implement global state contexts, code-splitting lazy loaders, and Vite production bundling."
            },
            {
                "id": "node-5",
                "title": f"Frontend Mastery & {role} Verification",
                "subtitle": "Phase 5 • Final Calibration",
                "type": "Performance Audit",
                "duration_mins": 20,
                "status": "locked",
                "description": f"Verify UI/UX accessibility standards and audit render performance for {role}."
            }
        ]

    # 3. AI / Machine Learning Architect
    elif any(k in role_lower for k in ["ai", "ml", "machine learning", "pytorch", "data scientist", "deep learning"]):
        return [
            {
                "id": "node-1",
                "title": "Tensor Mathematics & NumPy/Pandas Baseline",
                "subtitle": "Phase 1 • Orientation",
                "type": "Video Tutorial",
                "duration_mins": 20,
                "status": "completed",
                "description": "Calibrate matrix multiplication, gradient descent math, and data vectorization skills."
            },
            {
                "id": "node-2",
                "title": "PyTorch Neural Block & Autograd Pipeline",
                "subtitle": "Phase 2 • Focus Sprint Check-in",
                "type": "Focus Sprint",
                "duration_mins": 30,
                "status": "completed",
                "description": "Build modular PyTorch residual layers, loss functions, and backpropagation training loops."
            },
            {
                "id": "node-3",
                "title": "Vector Databases, Embeddings & RAG Systems",
                "subtitle": "Phase 3 • Active Journey Node",
                "type": "Interactive AI Feed",
                "duration_mins": 25,
                "status": "active",
                "description": "Construct high-signal retrieval-augmented generation pipelines using vector embeddings."
            },
            {
                "id": "node-4",
                "title": "LLM Fine-Tuning & Model Deployment",
                "subtitle": "Phase 4 • System Architecture",
                "type": "Deep Dive Article",
                "duration_mins": 45,
                "status": "locked",
                "description": "Quantize neural weights, serve inference models via FastAPI, and monitor latency bounds."
            },
            {
                "id": "node-5",
                "title": f"AI Benchmark & {role} Verification",
                "subtitle": "Phase 5 • Final Calibration",
                "type": "Performance Audit",
                "duration_mins": 20,
                "status": "locked",
                "description": f"Audit accuracy metrics and verify complete end-to-end pipeline for {role}."
            }
        ]

    # 4. Java / Enterprise Developer
    elif any(k in role_lower for k in ["java", "spring", "enterprise"]):
        return [
            {
                "id": "node-1",
                "title": "Java Object-Oriented Fundamentals & Core API",
                "subtitle": "Phase 1 • Orientation",
                "type": "Video Tutorial",
                "duration_mins": 20,
                "status": "completed",
                "description": "Establish baseline encapsulation, polymorphism, interfaces, and strong type safety."
            },
            {
                "id": "node-2",
                "title": "JVM Memory Tuning & Concurrency Streams",
                "subtitle": "Phase 2 • Focus Sprint Check-in",
                "type": "Focus Sprint",
                "duration_mins": 30,
                "status": "completed",
                "description": "Optimize Garbage Collection, heap stack allocations, and parallel Stream pipelines."
            },
            {
                "id": "node-3",
                "title": "Spring Boot Microservices & REST Controllers",
                "subtitle": "Phase 3 • Active Journey Node",
                "type": "Interactive AI Feed",
                "duration_mins": 25,
                "status": "active",
                "description": "Build Spring Data JPA repositories, Dependency Injection beans, and Spring Security."
            },
            {
                "id": "node-4",
                "title": "Distributed Messaging & Kafka Event Streams",
                "subtitle": "Phase 4 • System Architecture",
                "type": "Deep Dive Article",
                "duration_mins": 45,
                "status": "locked",
                "description": "Decouple microservices using Apache Kafka event topics and transaction managers."
            },
            {
                "id": "node-5",
                "title": f"Enterprise Audit & {role} Verification",
                "subtitle": "Phase 5 • Final Calibration",
                "type": "Performance Audit",
                "duration_mins": 20,
                "status": "locked",
                "description": f"Verify 10/10 node mastery and enterprise production standards for {role}."
            }
        ]

    # 5. Default Generic Role Generator
    else:
        return [
            {
                "id": "node-1",
                "title": f"Foundational {role} Principles & Calibration",
                "subtitle": "Phase 1 • Orientation",
                "type": "Video Tutorial",
                "duration_mins": 15,
                "status": "completed",
                "description": f"Establish core domain metrics and calibrate goal trajectory for {role}."
            },
            {
                "id": "node-2",
                "title": f"Deep Focus Execution Sprint for {role}",
                "subtitle": "Phase 2 • Sprint Check-in",
                "type": "Focus Sprint",
                "duration_mins": 25,
                "status": "completed",
                "description": "25-minute uninterrupted execution block targeting core skill building."
            },
            {
                "id": "node-3",
                "title": f"Identity Graph & Media Curation: {role}",
                "subtitle": "Phase 3 • Active Journey Node",
                "type": "Interactive AI Feed",
                "duration_mins": 20,
                "status": "active",
                "description": f"AI-curated high-signal learning resources specifically matching {role}."
            },
            {
                "id": "node-4",
                "title": f"Advanced System Design & Strategy for {role}",
                "subtitle": "Phase 4 • Skill Matrix",
                "type": "Deep Dive Article",
                "duration_mins": 40,
                "status": "locked",
                "description": f"Master high-level architecture, problem-solving frameworks, and real-world patterns."
            },
            {
                "id": "node-5",
                "title": f"Mastery Verification & {role} Audit",
                "subtitle": "Phase 5 • Final Calibration",
                "type": "Performance Audit",
                "duration_mins": 20,
                "status": "locked",
                "description": f"Verify 10/10 node mastery and optimize Value Per Minute index for {role}."
            }
        ]


@app.post("/api/roadmap")
async def get_dynamic_roadmap(req: RoadmapRequest):
    nodes = _build_dynamic_roadmap_nodes(req.aspiration, req.topics)
    return {
        "status": "success",
        "aspiration": req.aspiration,
        "roadmap": nodes
    }


def _analyze_intent(goal: str) -> Dict[str, Any]:
    g = goal.lower()
    if any(k in g for k in ["react", "hooks", "frontend", "javascript"]):
        domain = "React & Modern Frontend Architecture"
    elif any(k in g for k in ["machine learning", "ml", "neural", "ai", "deep learning"]):
        domain = "Machine Learning & AI Engineering"
    elif any(k in g for k in ["system design", "backend", "distributed", "microservice"]):
        domain = "Distributed System Design"
    elif any(k in g for k in ["sleep", "health", "fitness", "habit", "wellbeing"]):
        domain = "Circadian Health & Recovery"
    else:
        domain = "General Growth & Productivity"

    return {
        "primary_goal": goal,
        "domain": domain,
        "cognitive_energy_score": 85,
        "focus_priority": "High Signal Learning"
    }


# ═══════════════════════════════════════════════════════════════
# 5. USER ASPIRATION / ONBOARDING
# ═══════════════════════════════════════════════════════════════

def _fallback_assess_goal(baseline: str, aspiration: str, timeframe: str) -> Dict[str, Any]:
    asp = aspiration.strip()
    base = baseline.strip()
    timef = timeframe.strip()
    
    asp_lower = asp.lower()
    if "vlsi" in asp_lower or "hardware" in asp_lower or "design" in asp_lower or "digital" in asp_lower or "architecture" in asp_lower:
        feed_topics = ["Digital Logic", "Verilog RTL", "FPGA Design", "VLSI Design", "Computer Architecture"]
        roadmap = [
            {"phase": "Phase 1: Digital Logic Foundations", "duration": "1 month"},
            {"phase": "Phase 2: Verilog RTL & Simulation", "duration": "1.5 months"},
            {"phase": "Phase 3: FPGA Prototyping", "duration": "1.5 months"},
            {"phase": "Phase 4: Advanced System Architecture", "duration": "2 months"}
        ]
    elif "react" in asp_lower or "frontend" in asp_lower or "web" in asp_lower or "javascript" in asp_lower:
        feed_topics = ["React Hooks", "State Management", "Next.js Framework", "Web Performance", "Component Architecture"]
        roadmap = [
            {"phase": "Phase 1: Modern JavaScript & React Basics", "duration": "1 month"},
            {"phase": "Phase 2: Advanced State & Component Patterns", "duration": "1.5 months"},
            {"phase": "Phase 3: Next.js & Server Side Rendering", "duration": "1.5 months"},
            {"phase": "Phase 4: Performance Profiling & Optimization", "duration": "2 months"}
        ]
    elif "ml" in asp_lower or "machine learning" in asp_lower or "ai" in asp_lower or "deep learning" in asp_lower or "python" in asp_lower:
        feed_topics = ["Linear Algebra", "Supervised Learning", "Neural Networks", "Deep Learning", "Transformer Models"]
        roadmap = [
            {"phase": "Phase 1: Math & Python Foundations", "duration": "1 month"},
            {"phase": "Phase 2: Classical Machine Learning Sprints", "duration": "1.5 months"},
            {"phase": "Phase 3: Deep Learning & PyTorch", "duration": "1.5 months"},
            {"phase": "Phase 4: Generative AI & LLM Fine-Tuning", "duration": "2 months"}
        ]
    else:
        feed_topics = [f"{asp} Basics", f"{asp} Core Tools", f"{asp} Advanced Concepts", f"{asp} System Design", f"{asp} Optimization"]
        roadmap = [
            {"phase": f"Phase 1: {asp} Fundamentals", "duration": "1 month"},
            {"phase": f"Phase 2: Core {asp} Hands-on Practice", "duration": "1.5 months"},
            {"phase": f"Phase 3: Advanced {asp} Integration", "duration": "1.5 months"},
            {"phase": f"Phase 4: {asp} Portfolio & Mastery", "duration": "2 months"}
        ]

    return {
        "condition_vector": f"Baseline: {base}",
        "target_vector": f"Aspiration: {asp} within {timef}",
        "roadmap": roadmap,
        "initial_feed_topics": feed_topics
    }

@app.post("/api/assess-goal", response_model=OnboardingAssessResponse)
@app.post("/api/onboarding/assess-goal", response_model=OnboardingAssessResponse)
async def assess_goal(req: OnboardingAssessRequest):
    """Post-auth onboarding step: assesses user baseline, goal, and timeframe via Gemini."""
    user_id = req.user_id or "usr_default"
    
    prompt = f"""
    You are an Agentic Skill Architect. Analyze the user's current baseline, target aspiration, and target timeframe.
    User Baseline: {req.baseline}
    User Aspiration: {req.aspiration}
    User Timeframe: {req.timeframe}

    Generate a structured JSON response containing:
    1. `condition_vector`: Summary of current baseline (max 15 words).
    2. `target_vector`: Summary of target goal (max 15 words).
    3. `roadmap`: An array of 4 sequential milestone phases (e.g., Phase 1: Digital Logic Foundations, Phase 2: Verilog RTL, etc.) with estimated durations.
    4. `initial_feed_topics`: An array of 5 specific high-signal keywords to seed their initial curated feed.

    Return ONLY a valid JSON object. Do not include markdown backticks (like ```json).
    Example schema:
    {{
      "condition_vector": "First-year CS student with basic C/Python baseline",
      "target_vector": "VLSI Hardware Design & System Architecture expertise",
      "roadmap": [
        {{ "phase": "Phase 1: Digital Logic Foundations", "duration": "1.5 months" }},
        {{ "phase": "Phase 2: Verilog RTL Design & Simulation", "duration": "1.5 months" }},
        {{ "phase": "Phase 3: FPGA Prototyping & Verification", "duration": "1.5 months" }},
        {{ "phase": "Phase 4: Advanced ASIC/VLSI & System Architecture", "duration": "1.5 months" }}
      ],
      "initial_feed_topics": ["Digital Logic", "Verilog RTL", "FPGA Design", "VLSI Design", "Computer Architecture"]
    }}
    """.strip()

    raw_text = _generate_gemini(prompt)
    assessment = None
    if raw_text:
        try:
            raw = raw_text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(raw)
            if "condition_vector" in parsed and "roadmap" in parsed:
                assessment = parsed
        except Exception as e:
            print(f"[FastAPI] Gemini onboarding parse error: {e}")
            
    if not assessment:
        assessment = _fallback_assess_goal(req.baseline, req.aspiration, req.timeframe)

    # Persist in memory profiles under the user
    profile = in_memory_db["user_profiles"].get(user_id)
    if not profile:
        profile = {
            "user_id": user_id,
            "name": user_id.split("@")[0].title() if "@" in user_id else "Atharva Sur",
            "role": req.baseline,
            "aspiration": req.aspiration,
            "email": user_id if "@" in user_id else "atharva@synapse.ai",
            "streak": "1-Day Focus Streak",
            "level": "1",
            "xp": "0",
            "focus_time": "0h 0m",
            "skills_verified": "0 Concepts",
            "goal_velocity": "0%",
            "vpm_index": "$0.00/min"
        }
    else:
        profile["role"] = req.baseline
        profile["aspiration"] = req.aspiration
        
    profile["condition_vector"] = assessment["condition_vector"]
    profile["target_vector"] = assessment["target_vector"]
    profile["roadmap"] = assessment["roadmap"]
    profile["initial_feed_topics"] = assessment["initial_feed_topics"]
    
    in_memory_db["user_profiles"][user_id] = profile

    if supabase_client:
        try:
            supabase_client.from_("profiles").upsert([{
                "user_id": user_id,
                "display_name": profile["name"],
                "role_title": req.baseline
            }]).execute()
        except Exception as e:
            print(f"[FastAPI] Supabase save error: {e}")

    return OnboardingAssessResponse(
        condition_vector=assessment["condition_vector"],
        target_vector=assessment["target_vector"],
        roadmap=[Milestone(phase=m["phase"], duration=m["duration"]) for m in assessment["roadmap"]],
        initial_feed_topics=assessment["initial_feed_topics"]
    )

@app.post("/api/aspiration")
async def save_aspiration(req: AspirationRequest):
    """Store user growth aspiration and target timeline."""
    asp_obj = {
        "user_id": req.user_id or "usr_default",
        "aspiration": req.aspiration,
        "target_timeline": req.target_timeline,
        "current_level": req.current_level,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    in_memory_db["user_aspirations"].append(asp_obj)

    if supabase_client:
        try:
            res = supabase_client.table("user_aspirations").insert(asp_obj).execute()
            if res.data:
                return {"status": "success", "data": res.data}
        except Exception:
            pass

    return {"status": "success", "data": [asp_obj]}


@app.get("/api/aspiration")
async def get_aspiration(user_id: Optional[str] = "usr_default"):
    """Fetch user aspirations."""
    if supabase_client:
        try:
            res = supabase_client.table("user_aspirations").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            if res.data:
                return {"aspirations": res.data}
        except Exception:
            pass

    user_asps = [a for a in in_memory_db["user_aspirations"] if a.get("user_id") == user_id]
    return {"aspirations": user_asps}


# ═══════════════════════════════════════════════════════════════
# 6. FOCUS ROOM SESSIONS
# ═══════════════════════════════════════════════════════════════

@app.post("/api/focus-sessions")
async def save_focus_session(req: FocusSessionRequest):
    """Log a completed focus room session."""
    session_obj = {
        "user_id": req.user_id or "usr_default",
        "task_name": req.task_name,
        "duration_minutes": req.duration_minutes,
        "distractions_blocked": req.distractions_blocked,
        "completed_at": req.completed_at or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    in_memory_db["focus_sessions"].append(session_obj)

    if supabase_client:
        try:
            res = supabase_client.table("focus_sessions").insert(session_obj).execute()
            if res.data:
                return {"status": "success", "data": res.data}
        except Exception:
            pass

    return {"status": "success", "data": [session_obj]}


@app.get("/api/focus-sessions")
async def get_focus_sessions(user_id: Optional[str] = "usr_default"):
    """Fetch completed focus sessions."""
    if supabase_client:
        try:
            res = supabase_client.table("focus_sessions").select("*").eq("user_id", user_id).execute()
            if res.data:
                return {"sessions": res.data}
        except Exception:
            pass

    user_sessions = [s for s in in_memory_db["focus_sessions"] if s.get("user_id") == user_id]
    return {"sessions": user_sessions}


# ═══════════════════════════════════════════════════════════════
# 7. REFLECTIONS & JOURNALING
# ═══════════════════════════════════════════════════════════════

@app.post("/api/reflections")
async def save_reflection(req: ReflectionRequest):
    """Store a daily wellbeing reflection."""
    ref_obj = {
        "user_id": req.user_id or "usr_default",
        "mood": req.mood,
        "log_text": req.log_text,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    in_memory_db["reflections"].append(ref_obj)

    if supabase_client:
        try:
            res = supabase_client.table("reflections").insert(ref_obj).execute()
            if res.data:
                return {"status": "success", "data": res.data}
        except Exception:
            pass

    return {"status": "success", "data": [ref_obj]}


@app.get("/api/reflections")
async def get_reflections(user_id: Optional[str] = "usr_default"):
    """Retrieve saved reflections."""
    if supabase_client:
        try:
            res = supabase_client.table("reflections").select("*").eq("user_id", user_id).execute()
            if res.data:
                return {"reflections": res.data}
        except Exception:
            pass

    user_refs = [r for r in in_memory_db["reflections"] if r.get("user_id") == user_id]
    return {"reflections": user_refs}


# ═══════════════════════════════════════════════════════════════
# 8. AUTHENTICATION & USER PROFILE ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.post("/api/auth/register")
async def register(req: AuthRegisterRequest):
    """Register a new account via FastAPI."""
    email_clean = req.email.strip().lower()
    
    # Check if user already exists
    existing = next((u for u in in_memory_db["users"] if u["email"].lower() == email_clean), None)
    if existing:
        return {"status": "success", "user": {"id": existing["id"], "email": existing["email"], "name": existing["name"]}}

    user_id = f"usr_{int(time.time() * 1000)}"
    user_obj = {
        "id": user_id,
        "email": email_clean,
        "password": req.password,
        "name": req.display_name or email_clean.split("@")[0]
    }
    in_memory_db["users"].append(user_obj)

    if supabase_client:
        try:
            supabase_client.from_("profiles").upsert([{
                "user_id": user_id,
                "display_name": user_obj["name"],
                "current_role": "Growth Catalyst • Tier 3"
            }]).execute()
        except Exception:
            pass

    return {"status": "success", "user": {"id": user_id, "email": email_clean, "name": user_obj["name"]}}


@app.post("/api/auth/login")
async def login(req: AuthLoginRequest):
    """Authenticate user credentials via FastAPI."""
    email_clean = req.email.strip().lower()

    user = next((u for u in in_memory_db["users"] if u["email"].lower() == email_clean), None)
    if not user:
        # Create user on first login for seamless hackathon UX
        user_id = f"usr_{int(time.time() * 1000)}"
        user = {
            "id": user_id,
            "email": email_clean,
            "password": req.password,
            "name": email_clean.split("@")[0].title()
        }
        in_memory_db["users"].append(user)

    if user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid password provided.")

    return {
        "status": "success",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }


@app.get("/api/user/profile")
async def get_profile(user_id: Optional[str] = "usr_default"):
    """Fetch user VPM & identity profile from FastAPI."""
    profile = in_memory_db["user_profiles"].get(user_id)
    if not profile:
        if user_id == "usr_default":
            profile = {
                "user_id": user_id,
                "name": "Atharva Sur",
                "role": "Growth Catalyst • Tier 3",
                "aspiration": "Senior AI Architect",
                "email": "atharva@synapse.ai",
                "streak": "4-Day Focus Streak",
                "level": "14",
                "xp": "3,420",
                "focus_time": "2h 15m",
                "skills_verified": "12 Concepts",
                "goal_velocity": "84%",
                "vpm_index": "$4.82/min"
            }
        else:
            profile = {
                "user_id": user_id,
                "name": user_id.split("@")[0].title() if "@" in user_id else "New User",
                "role": "Growth Aspirant",
                "aspiration": "",  # Uninitialized!
                "email": user_id if "@" in user_id else "new_user@synapse.ai",
                "streak": "0-Day Focus Streak",
                "level": "1",
                "xp": "0",
                "focus_time": "0h 0m",
                "skills_verified": "0 Concepts",
                "goal_velocity": "0%",
                "vpm_index": "$0.00/min"
            }
    return {"profile": profile}


@app.post("/api/user/profile")
async def save_profile(req: UserProfileData):
    """Update user profile metrics."""
    user_id = req.user_id or "usr_default"
    data_dict = req.dict()
    in_memory_db["user_profiles"][user_id] = data_dict
    return {"status": "success", "profile": data_dict}


# ═══════════════════════════════════════════════════════════════
# UTILITIES & SYSTEM STATUS
# ═══════════════════════════════════════════════════════════════

def _build_suggestions(prompt: str) -> List[str]:
    p = prompt.lower()
    if any(k in p for k in ["focus", "distract", "productiv"]):
        return ["Start a 25-min focus sprint", "Block social media now", "Try box breathing"]
    if any(k in p for k in ["goal", "learn", "study", "master"]):
        return ["Curate 4 resources for me", "Analyse my aspiration gap", "Build 7-day roadmap"]
    if any(k in p for k in ["tired", "sleep", "energy", "burnout"]):
        return ["View sleep protocol", "Log energy baseline", "Start recovery sprint"]
    return ["Analyse my aspiration gap", "Generate a focus sprint", "Curate 4 resources"]

# ═══════════════════════════════════════════════════════════════
# 10. GOAL-BASED COMMUNITY COHORTS & AI FACILITATOR
# ═══════════════════════════════════════════════════════════════

class CommunityMessageRequest(BaseModel):
    community_id: str
    sender_id: str
    sender_name: str
    text: str
    role: Optional[str] = "user"

class TriggerAnnouncementRequest(BaseModel):
    community_id: str

def _classify_community(aspiration: str) -> dict:
    asp = (aspiration or "").lower()
    if any(k in asp for k in ["ai", "ml", "machine learning", "data science", "neural", "nlp", "computer vision", "intelligence", "llm"]):
        return {
            "id": "ai-ml",
            "name": "🤖 AI & Machine Learning Hub",
            "description": "Collaborate with neural architects, machine learning engineers, and researchers designing next-gen cognitive systems.",
            "agent_name": "Aether-AI Facilitator",
            "agent_avatar": "🤖",
            "agent_prompt": "You are Aether-AI, the expert Community Facilitator AI for the AI & Machine Learning Hub. Keep announcements highly technical, motivational, and centered on AI systems, deep learning models, and training loops."
        }
    elif any(k in asp for k in ["software", "architect", "developer", "engineer", "full-stack", "backend", "frontend", "react", "rust", "web", "html", "css", "js", "javascript"]):
        return {
            "id": "full-stack",
            "name": "💻 Software & Full-Stack Development",
            "description": "Connect with backend, frontend, and systems engineers building scalable, reliable, and high-performance applications.",
            "agent_name": "Nexus-Dev Facilitator",
            "agent_avatar": "💻",
            "agent_prompt": "You are Nexus-Dev, the expert Community Facilitator AI for the Software & Full-Stack Development cohort. Keep announcements practical, focusing on code quality, performance indexing, concurrent scaling, and software craftsmanship."
        }
    else:
        return {
            "id": "growth",
            "name": "🌱 Peak Performance & Wellbeing",
            "description": "Engage with productivity practitioners, founders, and growth catalysts training their deep work endurance and bio-routines.",
            "agent_name": "Soma-Growth Facilitator",
            "agent_avatar": "🌱",
            "agent_prompt": "You are Soma-Growth, the expert Community Facilitator AI for the Peak Performance & Wellbeing cohort. Keep announcements focused on deep focus habits, circadian science, mental longevity, recovery protocols, and bio-routines."
        }

def _get_community_messages(community_id: str) -> List[Dict[str, Any]]:
    try:
        conn = sqlite3.connect("users.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM community_messages WHERE community_id = ? ORDER BY id ASC", 
            (community_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        messages = []
        for r in rows:
            messages.append({
                "id": r["id"],
                "community_id": r["community_id"],
                "sender_id": r["sender_id"],
                "sender_name": r["sender_name"],
                "role": r["role"],
                "text": r["text"],
                "is_announcement": bool(r["is_announcement"]),
                "created_at": r["created_at"]
            })
        return messages
    except Exception as e:
        print(f"[FastAPI] SQLite community fetch error: {e}")
        return [m for m in in_memory_db.get("community_messages", []) if m["community_id"] == community_id]

def _record_community_message(community_id: str, sender_id: str, sender_name: str, role: str, text: str, is_announcement: bool = False):
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO community_messages (community_id, sender_id, sender_name, role, text, is_announcement, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (community_id, sender_id, sender_name, role, text, 1 if is_announcement else 0, created_at))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[FastAPI] SQLite community insert error: {e}")
        
    if "community_messages" not in in_memory_db:
        in_memory_db["community_messages"] = []
    
    msg_obj = {
        "id": int(time.time() * 1000),
        "community_id": community_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "role": role,
        "text": text,
        "is_announcement": is_announcement,
        "created_at": created_at
    }
    in_memory_db["community_messages"].append(msg_obj)
    return msg_obj

def seed_community_messages(community_id: str):
    existing = _get_community_messages(community_id)
    if existing:
        return
        
    if community_id == "ai-ml":
        _record_community_message(
            "ai-ml", "agent_ai_ml", "Aether-AI Facilitator", "assistant",
            "🚀 Welcome to the AI & Machine Learning Hub. I've compiled our baseline training objective: Reach 95%+ accuracy on local neural weights this week. Please review your active nodes and check the daily Curated Feed.",
            is_announcement=True
        )
        _record_community_message("ai-ml", "usr_sophia", "Sophia Chen (ML Researcher)", "user", "Hey everyone! Glad to join this cohort. Currently parsing the illustrated transformer guide to optimize my embedding dimensions.")
        _record_community_message("ai-ml", "usr_liam", "Liam Vance (Rust Dev)", "user", "Nice, Sophia! I'm working on running tokenization in Rust concurrency lanes. Need to reduce CPU context switching bottlenecks.")
        _record_community_message(
            "ai-ml", "agent_ai_ml", "Aether-AI Facilitator", "assistant",
            "Excellent alignment, Liam. Context switching accounts for up to 14% energy decay in deep focus sprints. I recommend mapping your concurrency threads explicitly using worker pools.",
            is_announcement=False
        )
    elif community_id == "full-stack":
        _record_community_message(
            "full-stack", "agent_fs", "Nexus-Dev Facilitator", "assistant",
            "⚡ Welcome to the Software & Full-Stack Development cohort. Our goal this week is reducing client-side bundle size and mastering reactive concurrency. Pinned resource: React useEffect deep dive.",
            is_announcement=True
        )
        _record_community_message("full-stack", "usr_alex", "Alex Mercer (Senior Full-Stack)", "user", "Hey all, just checked the useEffect guide. The explanation on clean-ups for abort controllers really cleaned up my socket listeners.")
        _record_community_message("full-stack", "usr_emily", "Emily Watson (Frontend Lead)", "user", "Agreed! Also, has anyone profiled React 19 concurrent renders yet? Finding some layout shifts on strict-mode loads.")
        _record_community_message(
            "full-stack", "agent_fs", "Nexus-Dev Facilitator", "assistant",
            "Emily, strict-mode doubles rendering intentionally to flag side-effects. To combat layout shifts, leverage useTransition to defer secondary paint cycles.",
            is_announcement=False
        )
    else:
        _record_community_message(
            "growth", "agent_growth", "Soma-Growth Facilitator", "assistant",
            "🌱 Welcome to the Peak Performance & Wellbeing cohort. Our foundational habit is anchoring 25-minute deep focus sprints with 5-minute restorative box breathing checks. Let's build momentum.",
            is_announcement=True
        )
        _record_community_message("growth", "usr_dan", "Dan Koe (Productivity Coach)", "user", "Absolutely loving the digital guardian focus room. Intercepted 30 mins of mindless social scrolling this morning!")
        _record_community_message("growth", "usr_clara", "Clara Oswald (Creative Founder)", "user", "Yes! My VPM index went up to $5.20/min after executing the Cal Newport Deep Work framework.")
        _record_community_message(
            "growth", "agent_growth", "Soma-Growth Facilitator", "assistant",
            "Incredible progression, Clara. A VPM exceeding $5.00/min indicates high cognitive alignment. Ensure you take a 10,000 lux light exposure break to protect your circadian rhythm.",
            is_announcement=False
        )

@app.get("/api/community/group")
async def get_community_group(user_id: str = "usr_default"):
    profile = in_memory_db["user_profiles"].get(user_id)
    aspiration = ""
    if profile:
        aspiration = profile.get("aspiration") or ""
    else:
        if user_id == "usr_default":
            aspiration = "Senior AI Architect"
    return _classify_community(aspiration)

@app.get("/api/community/messages")
async def get_community_messages(community_id: str):
    seed_community_messages(community_id)
    messages = _get_community_messages(community_id)
    return {"messages": messages}

@app.post("/api/community/messages")
async def post_community_message(req: CommunityMessageRequest):
    msg = _record_community_message(
        req.community_id, req.sender_id, req.sender_name, req.role or "user", req.text, is_announcement=False
    )
    if req.role == "user":
        agent_info = None
        for cid in ["ai-ml", "full-stack", "growth"]:
            cdata = _classify_community(cid if cid == req.community_id else "other")
            if cdata["id"] == req.community_id:
                agent_info = cdata
                break
        
        if agent_info:
            agent_name = agent_info["agent_name"]
            agent_prompt = agent_info["agent_prompt"]
            recent_msgs = _get_community_messages(req.community_id)[-8:]
            thread_context = "\n".join([f"{m['sender_name']}: {m['text']}" for m in recent_msgs])
            
            prompt = f"""
{agent_prompt}

You are in a community group chat. Here is the recent chat history:
{thread_context}

Provide a short, 1-2 sentence response addressed to the community or the last sender, offering technical insight, productivity feedback, or encouragement related to their discussion. Keep it concise, high-tech, and supportive. Do not use prefixes like "{agent_name}:". Just write the text.
"""
            ai_reply = _generate_gemini(prompt)
            if not ai_reply:
                if req.community_id == "ai-ml":
                    ai_reply = f"Acknowledged. We should keep an eye on model overfitting when adjusting weights. Have you validated your training data profile?"
                elif req.community_id == "full-stack":
                    ai_reply = f"Excellent point. Always remember to decouple database calls from UI paint lifecycles to avoid bottlenecking."
                else:
                    ai_reply = f"Well observed. Regular energy logging is critical to maintaining a high focus trajectory. Keep up the sprint alignment!"
            
            _record_community_message(
                req.community_id, f"agent_{req.community_id}", agent_name, "assistant", ai_reply, is_announcement=False
            )
            
    return {"status": "success", "message": msg}

@app.post("/api/community/trigger-announcement")
async def trigger_community_announcement(req: TriggerAnnouncementRequest):
    agent_info = None
    for cid in ["ai-ml", "full-stack", "growth"]:
        cdata = _classify_community(cid if cid == req.community_id else "other")
        if cdata["id"] == req.community_id:
            agent_info = cdata
            break
            
    if not agent_info:
        raise HTTPException(status_code=400, detail="Invalid community ID")
        
    agent_name = agent_info["agent_name"]
    agent_prompt = agent_info["agent_prompt"]
    
    prompt = f"""
{agent_prompt}

Create a premium, motivational community announcement for today. It should be a Daily Challenge, a high-value Tip, or an Announcement of a core goal.
It must contain:
1. A catchy bold title
2. An actionable 2-3 sentence description detailing a focus task or learning sprint.
Keep the style extremely professional, high-tech, and direct. Do not include markdown backticks or system prefixes. Just write the announcement text.
"""
    announcement_text = _generate_gemini(prompt)
    if not announcement_text:
        if req.community_id == "ai-ml":
            announcement_text = "**Daily Challenge: Loss Optimization**\n\nRun a 15-minute training calibration sprint. Attempt to reduce local weight entropy loss to below 0.10. Post your accuracy percentages in the chat!"
        elif req.community_id == "full-stack":
            announcement_text = "**Technical Tip: Async Hydration**\n\nAvoid loading layout states during hydrate cycles in concurrent React page renders. Use dynamic import boundaries to isolate resource-heavy charts."
        else:
            announcement_text = "**Wellbeing Protocol: 90-Min Focus Boundaries**\n\nEngage in a 90-minute intentional focus sprint, followed by a strict 10-minute zero-input recovery walk. Protect your cognitive bandwidth."
            
    msg = _record_community_message(
        req.community_id, f"agent_{req.community_id}", agent_name, "assistant", announcement_text, is_announcement=True
    )
    return {"status": "success", "announcement": msg}


class TutorRequest(BaseModel):
    topic: str

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
        "success": True,
        "topic": topic_text,
        "explanation": explanation_content
    }

@app.post("/signup")
async def signup(user: UserSignup):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                       (user.name, user.email, user.password))
        conn.commit()
        conn.close()
        return {
            "message": "Identity registered successfully",
            "access_token": f"token_for_{user.email}",
            "token_type": "bearer"
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Identity Vector (Email) already registered.")

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM users WHERE email = ?", (form_data.username,))
    result = cursor.fetchone()
    conn.close()
    if not result or result[0] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: Invalid Identity Vector or Security Key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {
        "access_token": f"token_for_{form_data.username}", 
        "token_type": "bearer"
    }

@app.post("/api/points/award")
async def award_points(req: PointsAwardRequest):
    if not supabase_client:
        return {"status": "success", "message": "Logged to in-memory fallback", "points": req.points}
    
    try:
        # 1. Log the interaction
        supabase_client.table("points_log").insert({
            "user_id": req.user_id,
            "action_type": req.action_type,
            "points_awarded": req.points
        }).execute()
        
        # 2. Update total points
        res = supabase_client.table("user_points").select("total_points").eq("user_id", req.user_id).execute()
        if res.data and len(res.data) > 0:
            new_points = res.data[0]["total_points"] + req.points
            supabase_client.table("user_points").update({"total_points": new_points}).eq("user_id", req.user_id).execute()
        else:
            new_points = req.points
            # Extract name from email if available or default to "User"
            supabase_client.table("user_points").insert({
                "user_id": req.user_id, 
                "total_points": new_points,
                "name": "User"
            }).execute()
            
        return {"status": "success", "total_points": new_points}
    except Exception as e:
        print(f"[FastAPI] Points award error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/points/balance")
async def get_points_balance(user_id: str = "usr_default"):
    if not supabase_client:
        return {"total_points": 0}
    try:
        res = supabase_client.table("user_points").select("total_points").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            return {"total_points": res.data[0]["total_points"]}
        return {"total_points": 0}
    except Exception as e:
        print(f"[FastAPI] Balance fetch error: {e}")
        return {"total_points": 0}

@app.get("/api/leaderboard")
async def get_leaderboard():
    if not supabase_client:
        return {"leaderboard": [{"name": "Mock User", "total_points": 100}]}
    
    try:
        res = supabase_client.table("user_points").select("*").order("total_points", desc=True).limit(10).execute()
        return {"leaderboard": res.data if res.data else []}
    except Exception as e:
        print(f"[FastAPI] Leaderboard fetch error: {e}")
        return {"leaderboard": []}


# ═══════════════════════════════════════════════════════════════
# 11. GOAL-BASED COMMUNITY COHORTS & AI FACILITATOR
# ═══════════════════════════════════════════════════════════════

class CommunityMessageRequest(BaseModel):
    community_id: str
    sender_id: str
    sender_name: str
    text: str
    role: Optional[str] = "user"


COMMUNITY_COHORTS = {
    "ai-ml": {
        "id": "ai-ml",
        "name": "Synapse AI & Neural Systems Cohort",
        "description": "Collaborative peer network for AI/ML engineering, system architecture, and cognitive optimization.",
        "member_count": 142,
        "agent_name": "Gemini-2.0-Flash",
        "agent_avatar": "🤖",
        "current_topic": "Optimizing LLM Inference Latency & RAG Vectors"
    },
    "full-stack": {
        "id": "full-stack",
        "name": "Full Stack & Cloud Architecture Cohort",
        "description": "High-velocity developers building resilient REST microservices, React UI design systems, and distributed databases.",
        "member_count": 98,
        "agent_name": "FastAPI-Architect",
        "agent_avatar": "⚡",
        "current_topic": "Async Event Loops & Tailwind Glassmorphism UI"
    },
    "growth": {
        "id": "growth",
        "name": "High-Signal Growth & Deep Focus Cohort",
        "description": "Productivity catalysts optimizing cognitive endurance, time-blocking, and Value Per Minute (VPM) metrics.",
        "member_count": 115,
        "agent_name": "VPM-Optimizer",
        "agent_avatar": "🌿",
        "current_topic": "Circadian Fatigue Reset & Box Breathing Sprints"
    }
}

COMMUNITY_MESSAGES_STORE: Dict[str, List[dict]] = {
    "ai-ml": [
        {
            "id": "msg-1",
            "community_id": "ai-ml",
            "sender_id": "agent-gemini",
            "sender_name": "Gemini-2.0-Flash",
            "text": "Welcome to the Synapse AI & Neural Systems Cohort! Share your current AI project or vector embedding pipeline.",
            "role": "assistant",
            "is_announcement": True,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        },
        {
            "id": "msg-2",
            "community_id": "ai-ml",
            "sender_id": "usr_sophia",
            "sender_name": "Sophia Chen",
            "text": "Currently fine-tuning PyTorch transformer weights for low-memory deployment!",
            "role": "user",
            "is_announcement": False,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    ],
    "full-stack": [
        {
            "id": "msg-1",
            "community_id": "full-stack",
            "sender_id": "agent-fastapi",
            "sender_name": "FastAPI-Architect",
            "text": "Welcome Full Stack Builders! Let's discuss microservice scalability and React component hygiene.",
            "role": "assistant",
            "is_announcement": True,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    ],
    "growth": [
        {
            "id": "msg-1",
            "community_id": "growth",
            "sender_id": "agent-vpm",
            "sender_name": "VPM-Optimizer",
            "text": "Welcome to the Deep Focus Cohort! Remember to log your 25-minute sprints and monitor cognitive fatigue.",
            "role": "assistant",
            "is_announcement": True,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    ]
}


@app.get("/api/community/group")
async def get_community_group(user_id: Optional[str] = "usr_default"):
    """Retrieve cohort allocation for user based on aspiration."""
    profile = in_memory_db["user_profiles"].get(user_id)
    asp = (profile.get("aspiration") if profile else "").lower()

    if any(k in asp for k in ["react", "frontend", "web", "full stack", "python"]):
        cohort_id = "full-stack"
    elif any(k in asp for k in ["growth", "focus", "health", "productivity"]):
        cohort_id = "growth"
    else:
        cohort_id = "ai-ml"

    return COMMUNITY_COHORTS[cohort_id]


@app.get("/api/community/messages")
async def get_community_messages(community_id: Optional[str] = "ai-ml"):
    """Retrieve chat history for a community group."""
    msgs = COMMUNITY_MESSAGES_STORE.get(community_id, [])
    return {"messages": msgs}


@app.post("/api/community/messages")
async def send_community_message(req: CommunityMessageRequest):
    """Post a message to a community cohort."""
    cid = req.community_id or "ai-ml"
    if cid not in COMMUNITY_MESSAGES_STORE:
        COMMUNITY_MESSAGES_STORE[cid] = []

    msg_obj = {
        "id": f"msg-{int(time.time()*1000)}",
        "community_id": cid,
        "sender_id": req.sender_id,
        "sender_name": req.sender_name,
        "text": req.text,
        "role": req.role or "user",
        "is_announcement": False,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    COMMUNITY_MESSAGES_STORE[cid].append(msg_obj)

    # AI Facilitator Response
    if req.role == "user":
        facilitator_name = COMMUNITY_COHORTS.get(cid, {}).get("agent_name", "AI Facilitator")
        ai_reply = _generate_gemini(f"You are the community facilitator ({facilitator_name}) for cohort {cid}. A member named {req.sender_name} posted: '{req.text}'. Provide a 2-sentence encouraging technical response.")
        if not ai_reply:
            ai_reply = f"Great insight @{req.sender_name}! Keep pushing your {cid} skill velocity."

        reply_obj = {
            "id": f"msg-{int(time.time()*1000)+1}",
            "community_id": cid,
            "sender_id": "agent-facilitator",
            "sender_name": facilitator_name,
            "text": ai_reply,
            "role": "assistant",
            "is_announcement": False,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        COMMUNITY_MESSAGES_STORE[cid].append(reply_obj)

    return {"status": "success", "message": msg_obj}


@app.post("/api/community/trigger-announcement")
async def trigger_community_announcement(req: Dict[str, Any]):
    cid = req.get("community_id", "ai-ml")
    facilitator_name = COMMUNITY_COHORTS.get(cid, {}).get("agent_name", "AI Facilitator")

    announcement_text = f"📢 **Cohort Milestone Alert:** Community members achieved 84% average skill velocity today! Keep up the focus sprints."

    announcement_obj = {
        "id": f"msg-{int(time.time()*1000)}",
        "community_id": cid,
        "sender_id": "agent-facilitator",
        "sender_name": facilitator_name,
        "text": announcement_text,
        "role": "assistant",
        "is_announcement": True,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    if cid not in COMMUNITY_MESSAGES_STORE:
        COMMUNITY_MESSAGES_STORE[cid] = []
    COMMUNITY_MESSAGES_STORE[cid].append(announcement_obj)

    return {"status": "success", "announcement": announcement_obj}


@app.get("/")
async def root():
    return {
        "status": "Synapse AI FastAPI Backend Engine is running ✅",
        "gemini": "connected" if gemini_configured else "offline (add GEMINI_API_KEY to backend/.env)",
        "supabase": "connected" if supabase_client else "offline (using FastAPI in-memory fallback store)",
        "docs": "http://localhost:8000/docs"
    }

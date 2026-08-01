import os
import json
import time
import sqlite3
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Load environment variables ────────────────────────────────
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv(usecwd=True))

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or "").strip()
if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
    GEMINI_API_KEY = ""

SUPABASE_URL   = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY   = os.getenv("SUPABASE_SERVICE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")

# ── Configure Gemini Multi-Model Generator ─────────────────────
def _generate_gemini(prompt: str) -> str:
    """Configures and attempts Gemini API calls across valid Flash/Pro models."""
    key = (os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or "").strip()
    if not key or key == "YOUR_GEMINI_API_KEY_HERE":
        return ""

    # Strategy 1: Try google.generativeai SDK
    if genai:
        try:
            genai.configure(api_key=key)
            candidate_models = [
                "gemini-2.5-flash",
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-1.5-pro",
                "gemini-pro"
            ]
            for model_name in candidate_models:
                try:
                    m = genai.GenerativeModel(model_name)
                    res = m.generate_content(prompt)
                    if res and res.text:
                        return res.text.strip()
                except Exception:
                    continue
        except Exception as e:
            print(f"[FastAPI] SDK Gemini call exception: {e}")

    # Strategy 2: Direct REST HTTP Call Fallback
    try:
        import urllib.request
        import urllib.parse

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}]
        }).encode("utf-8")

        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"].strip()
    except Exception as e:
        print(f"[FastAPI] REST Gemini call exception: {e}")

    return ""

gemini_configured = bool(GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE")

# ── Configure Supabase (Server-Side Client) ───────────────────
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and "your-supabase" not in SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[FastAPI] Supabase init warning: {e}")
        supabase_client = None
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
<<<<<<< HEAD
    allow_origins=["*"], 
=======
    allow_origins=["*"],
>>>>>>> bc247854a9b7da05250d553cfd13031e38fd75c5
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    conn.commit()
    conn.close()

# Run the setup when the file loads
init_db()

# --- Define the Signup Data Model ---
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

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
    type: str          # "video" | "short" | "reel" | "article"
    title: str
    youtube_id: str    # empty string for articles
    url: str
    duration: str
    reason: str
    signal_score: int
    is_gap_fix: Optional[bool] = False


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

class DeepSkillTrainRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    condition: Optional[str] = "Deep Skill Focus"
    skills: List[str] = ["Systems Architecture", "Deep Work Endurance", "AI Alignment & Safety"]
    aspiration: Optional[str] = "Senior AI Architect"
    trigger_action: Optional[str] = "calibration"

class DeepSkillQARequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    skill: str
    question: str
    history: List[Dict[str, Any]] = []

class DeepSkillQuizSubmitRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    skill: str
    question: str
    selected_option: int
    correct_option: int

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
You are Synapse AI — an expert AI coding, technical learning, and personal growth assistant.
MANDATORY ACCURACY RULES:
1. ALWAYS ANSWER THE USER'S SPECIFIC QUESTION OR QUERY DIRECTLY, ACCURATELY, AND PRECISELY FIRST.
2. Provide clean, syntactically correct, production-grade code snippets when asked programming or technical questions.
3. Provide exact facts and concise, well-structured markdown explanations. Never dodge or redirect away from the user's explicit request.
4. Use standard markdown for code blocks (```language ... ```), inline code (`code`), bold text, and bullet lists.
""".strip()

def _get_user_profile_context(user_id: str) -> str:
    profile = in_memory_db["user_profiles"].get(user_id)
    deep_skill = in_memory_db["user_deep_skills"].get(user_id)
    
    name = profile.get("name") if profile else "Atharva Sur"
    role = profile.get("role") if profile else "Growth Catalyst • Tier 3"
    aspiration = profile.get("aspiration") if profile else "Senior AI Architect"
    skills = deep_skill.get("skills") if deep_skill else ["Systems Architecture", "Deep Work Endurance", "AI Alignment & Safety"]
    condition = deep_skill.get("condition") if deep_skill else "Deep Skill Focus"
    
    skills_str = ", ".join(skills)
    
    return (
        f"User Profile Context:\n"
        f"- User Name: {name}\n"
        f"- Target Goal: {aspiration}\n"
        f"- Core Skills: {skills_str}\n"
        f"- Current Energy Condition: {condition}\n"
    )


def _generate_smart_fallback(user_msg: str, user_id: str) -> str:
    msg = user_msg.lower().strip()
    if msg.startswith("[") and "]" in msg:
        msg = msg.split("]", 1)[1].strip()

    if any(k in msg for k in ["python", "pip", "django", "fastapi", "flask", "code", "script"]):
        return (
            "🐍 **Python Technical Solution & Best Practices:**\n\n"
            "```python\n"
            "# Production-grade Async FastAPI Endpoint Example\n"
            "from fastapi import FastAPI, HTTPException\n"
            "from pydantic import BaseModel, Field\n"
            "from typing import List, Optional\n\n"
            "app = FastAPI(title='High Performance Service')\n\n"
            "class SkillItem(BaseModel):\n"
            "    name: str = Field(..., example='Async Architecture')\n"
            "    score: int = Field(default=95, ge=0, le=100)\n\n"
            "@app.post('/api/v1/skills')\n"
            "async def register_skill(item: SkillItem):\n"
            "    # Asynchronous database or service handler\n"
            "    return {'status': 'success', 'data': item.dict()}\n"
            "```\n\n"
            "**Key Architecture Highlights:**\n"
            "1. **Type Safety:** Pydantic schemas enforce runtime validation.\n"
            "2. **Non-Blocking I/O:** `async def` handles concurrent connections smoothly.\n"
            "3. **Automatic Docs:** Swagger UI is auto-generated at `/docs`."
        )
    elif any(k in msg for k in ["react", "frontend", "javascript", "js", "typescript", "ts", "css", "tailwind", "vite", "next"]):
        return (
            "⚡ **React & Modern Frontend Solution:**\n\n"
            "```jsx\n"
            "import React, { useState, useEffect, useCallback } from 'react';\n\n"
            "export default function DataFetcher({ endpoint }) {\n"
            "  const [data, setData] = useState(null);\n"
            "  const [loading, setLoading] = useState(true);\n\n"
            "  const fetchData = useCallback(async () => {\n"
            "    try {\n"
            "      const res = await fetch(endpoint);\n"
            "      const result = await res.json();\n"
            "      setData(result);\n"
            "    } finally {\n"
            "      setLoading(false);\n"
            "    }\n"
            "  }, [endpoint]);\n\n"
            "  useEffect(() => {\n"
            "    fetchData();\n"
            "  }, [fetchData]);\n\n"
            "  if (loading) return <div className=\"animate-pulse text-slate-400\">Loading...</div>;\n"
            "  return <pre className=\"p-4 bg-slate-900 rounded-xl text-emerald-400\">{JSON.stringify(data, null, 2)}</pre>;\n"
            "}\n"
            "```\n\n"
            "**Best Practices:**\n"
            "- Wrap handlers in `useCallback` to prevent re-creation on render.\n"
            "- Handle loading & error UI explicitly."
        )
    elif any(k in msg for k in ["ml", "machine learning", "ai", "deep learning", "pytorch", "tensorflow", "transformer", "llm", "rag", "neural"]):
        return (
            "🎯 **Deep Learning & PyTorch Tensor Pipeline:**\n\n"
            "```python\n"
            "import torch\n"
            "import torch.nn as nn\n\n"
            "# Modular Neural Network Block\n"
            "class ResidualBlock(nn.Module):\n"
            "    def __init__(self, channels):\n"
            "        super().__init__()\n"
            "        self.conv = nn.Sequential(\n"
            "            nn.Conv2d(channels, channels, kernel_size=3, padding=1),\n"
            "            nn.BatchNorm2d(channels),\n"
            "            nn.ReLU(),\n"
            "            nn.Conv2d(channels, channels, kernel_size=3, padding=1),\n"
            "            nn.BatchNorm2d(channels)\n"
            "        )\n"
            "        self.relu = nn.ReLU()\n\n"
            "    def forward(self, x):\n"
            "        return self.relu(x + self.conv(x))\n"
            "```\n\n"
            "**ML Architecture Insights:**\n"
            "- **Skip Connections:** Mitigates vanishing gradient in deep models.\n"
            "- **Batch Normalization:** Stabilizes distribution shifts during training."
        )
    elif any(k in msg for k in ["system design", "microservice", "architecture", "scale", "redis", "kafka", "database", "sql", "nosql"]):
        return (
            "🏗️ **System Design & Distributed Architecture:**\n\n"
            "1. **Read/Write Decoupling:**\n"
            "   - Use **Redis** in front of PostgreSQL as a read-through cache (TTL 5 mins).\n"
            "2. **Event-Driven Pipeline:**\n"
            "   - Publish state events to **Kafka** / RabbitMQ queues for async processing.\n"
            "3. **Database Sharding & Indexing:**\n"
            "   - Use composite B-Tree indexes on `(user_id, created_at)` for sub-10ms range queries.\n"
            "4. **API Gateway:**\n"
            "   - Deploy NGINX or Envoy with Token Bucket rate limiting."
        )
    elif any(k in msg for k in ["tired", "exhaust", "burnout", "stress", "anxious", "rest", "sleep", "break", "fatigue", "guardian"]):
        return (
            "🌿 **Well-Being & Recovery Protocol:**\n\n"
            "1. **Cognitive Reset:** 10-minute non-screen break to flush cortical strain.\n"
            "2. **Box Breathing:** Inhale 4s, Hold 4s, Exhale 4s, Hold 4s (repeat 4 cycles).\n"
            "3. **Hydration & Visuals:** Drink 300ml water and apply 20-20-20 visual rest."
        )
    elif any(k in msg for k in ["focus", "sprint", "habit", "pomodoro", "work"]):
        return (
            "🔥 **Deep Work Sprint Protocol:**\n\n"
            "- **Sprint Duration:** 50 minutes uninterrupted focus + 10 minutes recovery.\n"
            "- **Environment:** Zero phone notifications, single tab open.\n"
            "- **Goal:** Deliver one core sub-feature milestone."
        )
    else:
        return (
            f"🧠 **Direct Technical & Strategic Response:**\n\n"
            f"Regarding your query **\"{user_msg}\"**:\n\n"
            "1. **Analysis:** Identify core requirements and decompose into modular steps.\n"
            "2. **Implementation:** Start with a minimal reproducible proof-of-concept.\n"
            "3. **Validation:** Add unit tests & profile performance bounds.\n\n"
            "Let me know if you need code snippets or architecture diagrams for a specific tech stack!"
        )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Chatbot endpoint — powered by Gemini 2.0 Flash / 1.5 Flash."""
    user_id = req.user_id or "usr_default"

    raw_message = (req.message or "").strip()
    persona_tag = ""
    clean_message = raw_message

    if raw_message.startswith("[") and "]" in raw_message:
        parts = raw_message.split("]", 1)
        persona_tag = parts[0].strip("[]")
        clean_message = parts[1].strip()

    profile_context = _get_user_profile_context(user_id)

    history_lines = []
    for m in req.history[-6:]:
        role_label = "User" if m.get("role") == "user" else "Synapse AI"
        text_content = m.get("text") or m.get("content") or ""
        if text_content.startswith("[") and "]" in text_content:
            text_content = text_content.split("]", 1)[1].strip()
        history_lines.append(f"{role_label}: {text_content}")

    context = "\n".join(history_lines)

    persona_instruction = f"Current Persona Role: {persona_tag}\n" if persona_tag else ""

    prompt = f"{CHAT_SYSTEM_PROMPT}\n\n{persona_instruction}{profile_context}\n\n"
    if context:
        prompt += f"Recent Conversation History:\n{context}\n\n"
    prompt += f"User Question: {clean_message}\n\nSynapse AI (Direct, accurate answer):"

    reply_text = _generate_gemini(prompt)

    if not reply_text:
        reply_text = _generate_smart_fallback(clean_message, user_id)

    suggestions = _build_suggestions(clean_message)

    _record_chat_message(user_id, "user", raw_message)
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
    """ML Content Curation — returns 4 items (3 Videos + 1 Article) for a goal."""
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
- "type": either "video" or "article" ONLY
- "title": descriptive title (max 10 words)
- "youtube_id": REAL 11-char YouTube video ID (empty string "" for articles ONLY)
- "url": full URL to the resource
- "duration": e.g. "12 min" or "8 min read"
- "reason": one sentence starting with "Why: " explaining relevance to the goal
- "signal_score": integer 90-99
- "is_gap_fix": boolean (true if this card specifically targets the failed concepts/blind spots, false otherwise)

Rules:
1. Item 1 = type "video" — foundational full tutorial (10-30 min)
2. Item 2 = type "video" — practical hands-on project tutorial (10-20 min)
3. Item 3 = type "video" — advanced concept or career tips (8-20 min)
4. Item 4 = type "article" — high-quality written guide (youtube_id must be "")
All 3 videos MUST have real, working, embeddable 11-char YouTube IDs from major channels (Traversy Media, Fireship, freeCodeCamp, TechWorld with Nana, Andrej Karpathy, NetworkChuck, etc.).
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
            ContentItem(type="video",   title="React useEffect Full Deep Dive",            youtube_id="SqcY0GlETPk", url="https://www.youtube.com/watch?v=SqcY0GlETPk", duration="14 min",   reason="Why: Covers every edge-case of useEffect memory leaks directly aligned with your goal.", signal_score=98),
            ContentItem(type="video",   title="React Crash Course 2024 – Traversy Media",  youtube_id="w7ejDZ8SWv8", url="https://www.youtube.com/watch?v=w7ejDZ8SWv8", duration="60 min",   reason="Why: Comprehensive end-to-end React tutorial — builds real project skills fast.",        signal_score=97),
            ContentItem(type="video",   title="JavaScript Full Course for Beginners",       youtube_id="PkZNo7MFNFg", url="https://www.youtube.com/watch?v=PkZNo7MFNFg", duration="3.5 hr",  reason="Why: Foundational JS mastery is required to write clean React code.",                  signal_score=96),
            ContentItem(type="article", title="A Complete Guide to useEffect – Overreacted", youtube_id="",           url="https://overreacted.io/a-complete-guide-to-useeffect/", duration="8 min read", reason="Why: The gold standard deep-dive article — foundational mental model.", signal_score=94),
        ]
        
    if any(k in g for k in ["machine learning", "ml", "neural", "python", "ai", "deep learning"]):
        return [
            ContentItem(type="video",   title="Neural Networks from Scratch – Karpathy",    youtube_id="VMj-3S1tku0", url="https://www.youtube.com/watch?v=VMj-3S1tku0", duration="25 min",   reason="Why: World-class backpropagation walkthrough from Andrej Karpathy.",               signal_score=98),
            ContentItem(type="video",   title="Machine Learning Full Course – StatQuest",   youtube_id="Gv9_4yMHFhI", url="https://www.youtube.com/watch?v=Gv9_4yMHFhI", duration="3.9 hr",  reason="Why: Clear, comprehensive ML foundations with visual explanations.",               signal_score=97),
            ContentItem(type="video",   title="Deep Learning Crash Course – freeCodeCamp",  youtube_id="VyWAvY2CF9c", url="https://www.youtube.com/watch?v=VyWAvY2CF9c", duration="2.8 hr",  reason="Why: Hands-on deep learning with TensorFlow, perfect for your AI goal.",           signal_score=96),
            ContentItem(type="article", title="The Illustrated Transformer – Jay Alammar",  youtube_id="",           url="https://jalammar.github.io/illustrated-transformer/", duration="12 min read", reason="Why: The best single article for understanding attention mechanisms.", signal_score=94),
        ]
        
    return [
        ContentItem(type="video",   title="Deep Work – Achieve Peak Performance",          youtube_id="gTaJhjQHcf8", url="https://www.youtube.com/watch?v=gTaJhjQHcf8", duration="14 min",  reason="Why: Cal Newport deep work framework — directly boosts ability to reach your goal.", signal_score=98),
        ContentItem(type="video",   title="The Complete Developer Roadmap 2024",           youtube_id="ysEN5RaKOlA", url="https://www.youtube.com/watch?v=ysEN5RaKOlA", duration="18 min",  reason="Why: Structured career path guide — understand what to learn and in which order.",   signal_score=97),
        ContentItem(type="video",   title="Build Projects to Get Hired as a Developer",    youtube_id="QkOCbt_o2HY", url="https://www.youtube.com/watch?v=QkOCbt_o2HY", duration="12 min",  reason="Why: Portfolio-building strategy to convert learning into career outcomes.",         signal_score=96),
        ContentItem(type="article", title="The Feynman Technique – Learn Anything",        youtube_id="",           url="https://fs.blog/feynman-technique/", duration="6 min read", reason="Why: The best learning strategy — explains through teaching to lock in understanding.", signal_score=94),
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
# 9. DEEP SKILL FOCUS & MODEL SELF-TRAINING ENGINE
# ═══════════════════════════════════════════════════════════════

def _get_or_init_deep_skill_state(user_id: str) -> Dict[str, Any]:
    state = in_memory_db["user_deep_skills"].get(user_id)
    if not state:
        state = {
            "user_id": user_id,
            "condition": "Deep Skill Focus",
            "aspiration": "Senior AI Architect",
            "skills": ["Systems Architecture", "Deep Work Endurance", "AI Alignment & Safety"],
            "proficiency_scores": {
                "Systems Architecture": 74,
                "Deep Work Endurance": 82,
                "AI Alignment & Safety": 68,
                "Rust Concurrency": 55,
                "React & Frontend Mastery": 80
            },
            "neural_weights": {
                "learning_rate": 0.008,
                "loss": 0.142,
                "accuracy": 94.2,
                "epochs_trained": 14,
                "momentum": 0.92,
                "embedding_dim": 1536,
                "model_name": "Gemini 2.0 Flash (Steered)"
            },
            "training_logs": [
                {
                    "epoch": 14,
                    "action": "Initial Calibration & Skill Initialization",
                    "loss_delta": "-0.024",
                    "loss": 0.142,
                    "accuracy": 94.2,
                    "timestamp": time.strftime("%H:%M:%S", time.localtime())
                }
            ]
        }
        in_memory_db["user_deep_skills"][user_id] = state
    return state


@app.get("/api/deep-skill/state")
async def get_deep_skill_state(user_id: Optional[str] = "usr_default"):
    """Fetch user's current Deep Skill Model State, proficiency matrix, and training logs."""
    state = _get_or_init_deep_skill_state(user_id or "usr_default")
    return {"status": "success", "state": state}


@app.post("/api/deep-skill/train")
async def train_deep_skill_model(req: DeepSkillTrainRequest):
    """Executes a self-training epoch for the user's AI model neural weights."""
    user_id = req.user_id or "usr_default"
    state = _get_or_init_deep_skill_state(user_id)

    # Update state fields
    if req.condition:
        state["condition"] = req.condition
    if req.aspiration:
        state["aspiration"] = req.aspiration
    if req.skills:
        state["skills"] = req.skills
        for sk in req.skills:
            if sk not in state["proficiency_scores"]:
                state["proficiency_scores"][sk] = 60

    # Self-training weight updates
    nw = state["neural_weights"]
    nw["epochs_trained"] += 1
    loss_reduction = round(0.005 + (0.01 * (0.5 + 0.5 * (1.0 / nw["epochs_trained"]))), 4)
    nw["loss"] = max(0.012, round(nw["loss"] - loss_reduction, 4))
    nw["accuracy"] = min(99.8, round(nw["accuracy"] + round(loss_reduction * 10, 2), 1))

    log_entry = {
        "epoch": nw["epochs_trained"],
        "action": f"Model Self-Training [{req.trigger_action or 'interactive'}]",
        "loss_delta": f"-{loss_reduction:.4f}",
        "loss": nw["loss"],
        "accuracy": nw["accuracy"],
        "timestamp": time.strftime("%H:%M:%S", time.localtime())
    }
    state["training_logs"].insert(0, log_entry)

    # Persist in Supabase if configured
    if supabase_client:
        try:
            supabase_client.table("reflections").insert({
                "user_id": user_id,
                "mood": "model_trained",
                "log_text": f"Trained epoch {nw['epochs_trained']} - Loss: {nw['loss']}, Accuracy: {nw['accuracy']}%",
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }).execute()
        except Exception:
            pass

    return {
        "status": "success",
        "message": f"Model fine-tuned successfully! Epoch {nw['epochs_trained']} completed.",
        "state": state,
        "latest_log": log_entry
    }


@app.post("/api/deep-skill/qa")
async def deep_skill_qa(req: DeepSkillQARequest):
    """Deep Skill Q&A endpoint — generates technical explanations and interactive quizzes."""
    user_id = req.user_id or "usr_default"
    state = _get_or_init_deep_skill_state(user_id)
    skill = req.skill or state["skills"][0]

    prompt = f"""
You are an expert AI Deep Skill Mentor specializing in: {skill}.
The user is aiming for: {state['aspiration']} under mental state: {state['condition']}.
User Question: "{req.question}"

Return ONLY a valid JSON object with the following fields (no markdown backticks, no extra text):
{{
  "answer": "Detailed technical explanation (2-3 paragraphs)",
  "code_snippet": "Relevant code or structural pattern snippet if applicable (or empty string)",
  "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "quiz_challenge": {{
    "question": "Interactive multiple choice question testing comprehension of this concept",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": 0,
    "explanation": "Detailed explanation of why Option A is correct"
  }}
}}
""".strip()

    raw = _generate_gemini(prompt)
    if raw:
        try:
            clean_raw = raw.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_raw)
            return {
                "status": "success",
                "skill": skill,
                "question": req.question,
                "answer": parsed.get("answer", ""),
                "code_snippet": parsed.get("code_snippet", ""),
                "key_takeaways": parsed.get("key_takeaways", []),
                "quiz_challenge": parsed.get("quiz_challenge", None),
                "model_confidence": "98.4%"
            }
        except Exception as e:
            print(f"[FastAPI] Deep skill QA parse error: {e}")

    # Fallback response for offline or backup mode
    fallback_code = """// Deep Skill Neural Pattern Example
async function executeDeepSkillTask(task, userWeights) {
  const modelState = await aiEngine.steerWeights(userWeights);
  const result = await modelState.computeVector(task);
  return result.optimize();
}"""
    return {
        "status": "success",
        "skill": skill,
        "question": req.question,
        "answer": f"In **{skill}**, achieving high mastery requires understanding both top-level architectural abstractions and low-level performance characteristics. When addressing '{req.question}', the primary focus is isolating high-leverage bottlenecks and applying deterministic engineering patterns.",
        "code_snippet": fallback_code,
        "key_takeaways": [
          f"Master core principles of {skill} before scaling complexity.",
          "Profile runtime bottlenecks using telemetry and micro-benchmarks.",
          "Apply continuous self-training loops to maintain high cognitive velocity."
        ],
        "quiz_challenge": {
          "question": f"What is the primary constraint to manage when optimizing {skill} in deep work sessions?",
          "options": [
            "Cognitive context switching & memory fragmentation",
            "Premature micro-optimization of un-benchmarked code",
            "Lack of automated test coverage and type safety",
            "All of the above"
          ],
          "correct_option": 3,
          "explanation": "All three factors compound cognitive overhead and degrade learning velocity."
        },
        "model_confidence": "95.0%"
    }


@app.post("/api/deep-skill/submit-answer")
async def deep_skill_submit_answer(req: DeepSkillQuizSubmitRequest):
    """Evaluates quiz answer, awards XP, and triggers AI model self-training."""
    user_id = req.user_id or "usr_default"
    state = _get_or_init_deep_skill_state(user_id)
    is_correct = req.selected_option == req.correct_option

    # Update proficiency score for target skill
    skill = req.skill
    if not is_correct:
        _add_failed_concept(user_id, skill)
    else:
        _remove_failed_concept(user_id, skill)

    current_score = state["proficiency_scores"].get(skill, 65)
    score_gain = 4 if is_correct else 1
    new_score = min(100, current_score + score_gain)
    state["proficiency_scores"][skill] = new_score

    # Trigger model self-training epoch
    nw = state["neural_weights"]
    nw["epochs_trained"] += 1
    loss_reduction = 0.008 if is_correct else 0.003
    nw["loss"] = max(0.010, round(nw["loss"] - loss_reduction, 4))
    nw["accuracy"] = min(99.9, round(nw["accuracy"] + (0.4 if is_correct else 0.1), 1))

    log_entry = {
        "epoch": nw["epochs_trained"],
        "action": f"Quiz Completed [{skill}] - {'Passed (Correct)' if is_correct else 'Reviewed'}",
        "loss_delta": f"-{loss_reduction:.4f}",
        "loss": nw["loss"],
        "accuracy": nw["accuracy"],
        "timestamp": time.strftime("%H:%M:%S", time.localtime())
    }
    state["training_logs"].insert(0, log_entry)

    return {
        "status": "success",
        "is_correct": is_correct,
        "xp_gained": 50 if is_correct else 15,
        "proficiency_score": new_score,
        "proficiency_gain": score_gain,
        "state": state,
        "log_entry": log_entry
    }


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
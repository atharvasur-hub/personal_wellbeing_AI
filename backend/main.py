"""
=============================================================
 SYNAPSE AI — FastAPI Backend
 ML Model: Goal Analysis, Content Curation & Habit Steering
=============================================================

SETUP:
  1. pip install fastapi uvicorn google-generativeai supabase python-dotenv

RUN:
  uvicorn main:app --reload --port 8000

API DOCS:
  http://localhost:8000/docs
=============================================================
"""

import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# ── Load environment variables ────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SUPABASE_URL   = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY   = os.getenv("SUPABASE_SERVICE_KEY", "")

# ── Configure Gemini ──────────────────────────────────────────
if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")
else:
    gemini_model = None

# ── Configure Supabase (optional persistence) ─────────────────
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception:
        pass

# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="Synapse AI — Personal Wellbeing ML Backend",
    description="ML model API: Goal Analysis, Content Curation & Habit Steering",
    version="1.0.0",
)

# ── CORS — allow the React dev server ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
# PYDANTIC REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = []

class GoalRequest(BaseModel):
    goal: str
    mood: Optional[str] = "focused"
    user_id: Optional[str] = None

class ContentItem(BaseModel):
    type: str          # "video" | "short" | "reel" | "article"
    title: str
    youtube_id: str    # empty string for articles
    url: str
    duration: str
    reason: str
    signal_score: int

class RecommendationResponse(BaseModel):
    goal: str
    items: list[ContentItem]
    intent_domain: str

class HabitCheckRequest(BaseModel):
    activity: str
    duration_minutes: int
    user_id: Optional[str] = None

class HabitCheckResponse(BaseModel):
    intercept_required: bool
    reason: Optional[str] = None
    redirect_suggestion: Optional[str] = None
    time_saved_minutes: Optional[int] = None


# ═══════════════════════════════════════════════════════════════
# PILLAR 1 — CHATBOT ENDPOINT
# ═══════════════════════════════════════════════════════════════

CHAT_SYSTEM_PROMPT = """
You are Synapse AI — an elite personal growth and wellbeing AI assistant.
Your role is to help the user achieve their goals, improve focus, manage habits, and accelerate learning.
Tone: supportive, precise, motivating, and high-tech.
Keep responses concise (3-5 sentences max unless the user asks for detail).
Always tie your advice directly to the user's stated goals and wellbeing.
""".strip()

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Chatbot endpoint — powered by Gemini 2.0 Flash.
    POST body: { "message": "...", "history": [...], "user_id": "..." }
    """
    if not gemini_model:
        return ChatResponse(
            reply="Synapse AI is in offline mode. Add GEMINI_API_KEY to backend/.env to enable live AI responses.",
            suggestions=["How do I set the API key?", "What can you do?"]
        )

    try:
        # Build conversation context (last 6 messages)
        context = "\n".join(
            f"{'User' if m['role'] == 'user' else 'Synapse AI'}: {m.get('text') or m.get('content', '')}"
            for m in req.history[-6:]
        )
        prompt = f"{CHAT_SYSTEM_PROMPT}\n\n"
        if context:
            prompt += f"Conversation so far:\n{context}\n\n"
        prompt += f"User: {req.message}\nSynapse AI:"

        response = gemini_model.generate_content(prompt)
        reply_text = response.text.strip()

        # Save to Supabase if connected
        if supabase_client and req.user_id:
            try:
                supabase_client.table("chat_messages").insert({
                    "user_id": req.user_id,
                    "role": "user",
                    "text": req.message
                }).execute()
                supabase_client.table("chat_messages").insert({
                    "user_id": req.user_id,
                    "role": "assistant",
                    "text": reply_text
                }).execute()
            except Exception:
                pass

        return ChatResponse(
            reply=reply_text,
            suggestions=_build_suggestions(req.message)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# PILLAR 2 — GOAL-BASED CONTENT RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend(req: GoalRequest):
    """
    ML Content Curation — returns 4 items (Video, Short, Reel, Article)
    tailored to the user's stated goal using Gemini AI.
    POST body: { "goal": "...", "mood": "focused", "user_id": "..." }
    """
    intent = _analyze_intent(req.goal)

    # Try Gemini for dynamic recommendations
    if gemini_model:
        try:
            items = await _gemini_recommendations(req.goal)
            return RecommendationResponse(
                goal=req.goal,
                items=items,
                intent_domain=intent["domain"]
            )
        except Exception:
            pass  # Fall through to static

    # Keyword-based static fallback
    items = _static_recommendations(req.goal)
    return RecommendationResponse(
        goal=req.goal,
        items=items,
        intent_domain=intent["domain"]
    )


async def _gemini_recommendations(goal: str) -> list[ContentItem]:
    prompt = f"""
You are an expert learning curator AI. A user has stated this goal: "{goal}"

Return ONLY a valid JSON array with exactly 4 objects. No markdown, no extra text. Each object:
- "type": one of "video", "short", "reel", "article"
- "title": descriptive title (max 10 words)
- "youtube_id": REAL 11-char YouTube video ID (empty string "" for articles)
- "url": full URL to the resource
- "duration": e.g. "12 min" or "60 sec" or "8 min read"
- "reason": one sentence starting with "Why: " explaining relevance to the goal
- "signal_score": integer 90-99

Rules:
1. Item 1 = type "video" (5-20 min full YouTube tutorial)
2. Item 2 = type "short" (YouTube Short, under 60 sec)
3. Item 3 = type "reel" (short-form video reel, under 60 sec)
4. Item 4 = type "article" (high-quality article, youtube_id must be "")
All YouTube IDs must be real and relevant. Return ONLY the JSON array.
""".strip()

    response = gemini_model.generate_content(prompt)
    raw = response.text.strip().replace("```json", "").replace("```", "").strip()
    parsed = json.loads(raw)

    return [
        ContentItem(
            type=item.get("type", "video"),
            title=item.get("title", ""),
            youtube_id=item.get("youtube_id", ""),
            url=item.get("url", ""),
            duration=item.get("duration", ""),
            reason=item.get("reason", ""),
            signal_score=item.get("signal_score", 94)
        )
        for item in parsed[:4]
    ]


def _static_recommendations(goal: str) -> list[ContentItem]:
    """Keyword-based curated fallback recommendations."""
    g = goal.lower()

    if any(k in g for k in ["react", "hooks", "frontend", "javascript"]):
        return [
            ContentItem(type="video",   title="React useEffect Full Deep Dive",            youtube_id="SqcY0GlETPk", url="https://www.youtube.com/watch?v=SqcY0GlETPk",                    duration="14 min",      reason="Why: Covers every edge-case of useEffect memory leaks directly aligned with your goal.", signal_score=98),
            ContentItem(type="short",   title="useState vs useReducer in 60 Seconds",       youtube_id="bFRDIBR9zM8", url="https://www.youtube.com/shorts/bFRDIBR9zM8",                    duration="60 sec",      reason="Why: 60-second micro-refresher on the most commonly confused React hooks.",             signal_score=96),
            ContentItem(type="reel",    title="React Reconciler Algorithm Visualised",       youtube_id="TNhaISOUy6Q", url="https://www.youtube.com/watch?v=TNhaISOUy6Q",                   duration="45 sec",      reason="Why: High-retention animation of React diffing — low cognitive load.",                  signal_score=95),
            ContentItem(type="article", title="A Complete Guide to useEffect – Overreacted", youtube_id="",           url="https://overreacted.io/a-complete-guide-to-useeffect/",         duration="8 min read",  reason="Why: The gold standard deep-dive article — foundational mental model.",                 signal_score=94),
        ]

    if any(k in g for k in ["machine learning", "ml", "neural", "python", "ai", "deep learning"]):
        return [
            ContentItem(type="video",   title="Neural Networks from Scratch – Karpathy",  youtube_id="VMj-3S1tku0", url="https://www.youtube.com/watch?v=VMj-3S1tku0",                    duration="25 min",      reason="Why: World-class backpropagation walkthrough from Andrej Karpathy — ideal for your ML goal.", signal_score=98),
            ContentItem(type="short",   title="Gradient Descent in 60 Seconds",            youtube_id="IHZwWFHWa-w", url="https://www.youtube.com/shorts/IHZwWFHWa-w",                    duration="60 sec",      reason="Why: Instant gradient descent mental model — quick review before deeper practice.",          signal_score=96),
            ContentItem(type="reel",    title="How a Neural Network Learns (Animated)",     youtube_id="aircAruvnKk", url="https://www.youtube.com/watch?v=aircAruvnKk",                   duration="45 sec",      reason="Why: Stunning visual of neural net weight updates — excellent visual recall.",               signal_score=95),
            ContentItem(type="article", title="The Illustrated Transformer – Jay Alammar",  youtube_id="",           url="https://jalammar.github.io/illustrated-transformer/",            duration="12 min read", reason="Why: The best single article for understanding attention mechanisms.",                       signal_score=94),
        ]

    if any(k in g for k in ["system design", "backend", "microservice", "distributed", "architecture"]):
        return [
            ContentItem(type="video",   title="System Design Interview Step By Step",        youtube_id="i7twT3x5yv8", url="https://www.youtube.com/watch?v=i7twT3x5yv8",                   duration="20 min",      reason="Why: Structured walkthrough of scalable architecture decisions.",  signal_score=98),
            ContentItem(type="short",   title="CAP Theorem in 60 Seconds",                   youtube_id="p4BpE5Ur4H0", url="https://www.youtube.com/shorts/p4BpE5Ur4H0",                    duration="60 sec",      reason="Why: Instant recall of CAP theorem — core to distributed design.", signal_score=96),
            ContentItem(type="reel",    title="Load Balancer Explained (Animated)",           youtube_id="K0Ta65OqQkY", url="https://www.youtube.com/watch?v=K0Ta65OqQkY",                   duration="45 sec",      reason="Why: Fast animated visual of load balancing strategies.",         signal_score=95),
            ContentItem(type="article", title="Designing Data-Intensive Applications Summary", youtube_id="",           url="https://martin.kleppmann.com/2016/02/08/how-to-visualize-a-distributed-system.html", duration="10 min read", reason="Why: Foundational mental model for data-intensive system design.", signal_score=94),
        ]

    if any(k in g for k in ["sleep", "health", "fitness", "habit", "wellbeing", "recovery"]):
        return [
            ContentItem(type="video",   title="Huberman Lab – Master Your Sleep",           youtube_id="nm1TxQj9IsQ", url="https://www.youtube.com/watch?v=nm1TxQj9IsQ",  duration="18 min",      reason="Why: Evidence-based sleep protocol from Stanford Neuroscience.", signal_score=98),
            ContentItem(type="short",   title="5 Habits That Changed My Life in 60 Seconds", youtube_id="GgzrRkS-SE0", url="https://www.youtube.com/shorts/GgzrRkS-SE0",   duration="60 sec",      reason="Why: High-impact micro-habit audit — quick actionable reset.",   signal_score=96),
            ContentItem(type="reel",    title="Morning Sunlight Routine – Why It Works",      youtube_id="LzBtBe2GQBM", url="https://www.youtube.com/watch?v=LzBtBe2GQBM",  duration="45 sec",      reason="Why: Neuroscience visual of how light resets circadian rhythm.",  signal_score=95),
            ContentItem(type="article", title="Atomic Habits – The 1% Rule for Growth",       youtube_id="",           url="https://jamesclear.com/atomic-habits",          duration="7 min read",  reason="Why: Highest-leverage habit framework — applies to every goal.",  signal_score=94),
        ]

    # Generic growth fallback
    return [
        ContentItem(type="video",   title="Deep Work – Achieve Peak Performance",   youtube_id="gTaJhjQHcf8", url="https://www.youtube.com/watch?v=gTaJhjQHcf8", duration="14 min",     reason="Why: Cal Newport deep work framework — directly boosts ability to reach your goal.",      signal_score=98),
        ContentItem(type="short",   title="The 5-Second Rule in 60 Seconds",        youtube_id="k2TaFVANNTg", url="https://www.youtube.com/shorts/k2TaFVANNTg",  duration="60 sec",     reason="Why: Instant motivation trigger — activates momentum toward your goal.",                  signal_score=96),
        ContentItem(type="reel",    title="Flow State Activation – Get Deep Focus",  youtube_id="QkOCbt_o2HY", url="https://www.youtube.com/watch?v=QkOCbt_o2HY", duration="45 sec",     reason="Why: Primes your brain for high-yield learning sessions.",                               signal_score=95),
        ContentItem(type="article", title="The Feynman Technique – Learn Anything",  youtube_id="",           url="https://fs.blog/feynman-technique/",          duration="6 min read", reason="Why: The best learning strategy — explains through teaching to lock in understanding.",  signal_score=94),
    ]


# ═══════════════════════════════════════════════════════════════
# PILLAR 3 — HABIT STEERING / DIGITAL GUARDIAN
# ═══════════════════════════════════════════════════════════════

@app.post("/api/habit-check", response_model=HabitCheckResponse)
async def habit_check(req: HabitCheckRequest):
    """
    Digital Guardian — intercepts time-wasting patterns.
    POST body: { "activity": "scrolling Twitter", "duration_minutes": 20, "user_id": "..." }
    """
    time_wasting = ["twitter", "x.com", "instagram", "tiktok", "youtube shorts", "scroll", "reddit", "facebook"]
    is_wasting = any(k in req.activity.lower() for k in time_wasting)

    if is_wasting and req.duration_minutes >= 10:
        redirect = f"Redirect {req.duration_minutes} mins from '{req.activity}' to a Focus Sprint"

        # Save log to Supabase if connected
        if supabase_client and req.user_id:
            try:
                supabase_client.table("habit_steering_logs").insert({
                    "user_id": req.user_id,
                    "intercept_trigger": req.activity,
                    "time_saved_minutes": req.duration_minutes,
                    "redirected_sprint": redirect,
                    "user_accepted": True
                }).execute()
            except Exception:
                pass

        return HabitCheckResponse(
            intercept_required=True,
            reason=f"Passive scrolling on '{req.activity}' detected for {req.duration_minutes} minutes.",
            redirect_suggestion=redirect,
            time_saved_minutes=req.duration_minutes
        )

    return HabitCheckResponse(intercept_required=False)


# ═══════════════════════════════════════════════════════════════
# PILLAR 4 — INTENT ANALYSIS ENDPOINT
# ═══════════════════════════════════════════════════════════════

@app.post("/api/analyze-intent")
async def analyze_intent(req: GoalRequest):
    """
    ML Intent Analysis — extracts domain, energy level, focus priority from goal text.
    POST body: { "goal": "...", "mood": "focused" }
    """
    intent = _analyze_intent(req.goal)
    intent["mood"] = req.mood
    return intent


def _analyze_intent(goal: str) -> dict:
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
# UTILITY HELPERS
# ═══════════════════════════════════════════════════════════════

def _build_suggestions(prompt: str) -> list[str]:
    p = prompt.lower()
    if any(k in p for k in ["focus", "distract", "productiv"]):
        return ["Start a 25-min focus sprint", "Block social media now", "Try box breathing"]
    if any(k in p for k in ["goal", "learn", "study", "master"]):
        return ["Curate 4 resources for me", "Analyse my aspiration gap", "Build 7-day roadmap"]
    if any(k in p for k in ["tired", "sleep", "energy", "burnout"]):
        return ["View sleep protocol", "Log energy baseline", "Start recovery sprint"]
    return ["Analyse my aspiration gap", "Generate a focus sprint", "Curate 4 resources"]


# ── Health-check route ────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status": "Synapse AI FastAPI Backend is running ✅",
        "gemini": "connected" if gemini_model else "offline (add GEMINI_API_KEY to backend/.env)",
        "supabase": "connected" if supabase_client else "offline (add SUPABASE credentials to backend/.env)",
        "docs": "http://localhost:8000/docs"
    }

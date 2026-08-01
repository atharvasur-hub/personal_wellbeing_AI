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
import json
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai

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
    """Configures and attempts Gemini API calls across multiple Flash/Pro models."""
    key = (os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or "").strip()
    if not key or key == "YOUR_GEMINI_API_KEY_HERE":
        return ""
    try:
        genai.configure(api_key=key)
        candidate_models = [
            "gemini-2.5-flash",
            "gemini-3.6-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-2.5-pro",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
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
        print(f"[FastAPI] Gemini call exception: {e}")
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
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ═══════════════════════════════════════════════════════════════

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
        reply_text = "Synapse AI is operating in offline mode. Please add your free GEMINI_API_KEY to backend/.env (GEMINI_API_KEY=AIzaSy...) or root .env to unlock live Gemini responses."
        suggestions = ["Where do I get a free API key?", "How do I set backend/.env?", "What can Synapse AI do?"]
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


@app.get("/")
async def root():
    return {
        "status": "Synapse AI FastAPI Backend Engine is running ✅",
        "gemini": "connected" if gemini_configured else "offline (add GEMINI_API_KEY to backend/.env)",
        "supabase": "connected" if supabase_client else "offline (using FastAPI in-memory fallback store)",
        "docs": "http://localhost:8000/docs"
    }

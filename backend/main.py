from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3 # Built-in Python database!

app = FastAPI(title="Agentic Growth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
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

@app.get("/")
async def root():
    return {"status": "System Online", "message": "FastAPI backend is running."}

# --- 2. The Signup Endpoint (Saves to DB) ---
@app.post("/signup")
async def signup(user: UserSignup):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        # Insert the new user into the database
        # NOTE: In a real production app, you would hash this password! 
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
        # This triggers if the email is already in the database
        raise HTTPException(status_code=400, detail="Identity Vector (Email) already registered.")

# --- 3. The Login Endpoint (Reads from DB) ---
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # Look up the user by email
    cursor.execute("SELECT password FROM users WHERE email = ?", (form_data.username,))
    result = cursor.fetchone()
    conn.close()

    # Check if user exists AND if the password matches
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
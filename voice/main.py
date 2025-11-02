import os
import base64
import asyncio
from datetime import datetime, timedelta
from typing import Dict
import re # For safety keyword search
# --- NEW IMPORTS FOR OFFICIAL GOOGLE TTS ---
from google.cloud import texttospeech
# -------------------------------------------

from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings

# Rate Limiting Imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import google.generativeai as genai
from google.generativeai import ChatSession
from dotenv import load_dotenv

# --- 1. Configuration Settings ---
class Settings(BaseSettings):
    """Loads settings from .env file or environment variables."""
    google_api_key: str = Field(..., env='GOOGLE_API_KEY')
    # --- FIX APPLIED HERE: Added explicit localhost origins for development ---
    allowed_origins: list = ["*", "http://127.0.0.1:8000", "http://localhost:8000"] 
    max_message_length: int = 1000
    session_timeout_hours: int = 24
    server_port: int = 8000 # Default port

    class Config:
        env_file = ".env"

# Load environment variables and settings
load_dotenv()
try:
    settings = Settings()
except Exception as e:
    print(f"FATAL ERROR: Failed to load settings. Ensure GOOGLE_API_KEY is set in .env or environment. Details: {e}")
    raise SystemExit(1)

# --- 2. Constants and System Prompts (Unchanged) ---
MANNASAHAY_PROMPT = """
You are 'MannSahay', a compassionate and empathetic mental health companion. 
Your primary role is to be a supportive and non-judgemental listener.

RULES:
1.  **Persona**: You are warm, understanding, and patient. Use a calm, gentle, and supportive tone.
2.  **Focus**: Your goal is to help the user feel heard. Encourage them to express their feelings. Ask open-ended questions like "How does that make you feel?" or "Can you tell me more about that?"
3.  **Do Not Diagnose**: You are NOT a medical professional. You MUST NOT diagnose conditions, offer medical advice, or suggest treatment plans.
4.  **Safety Override**: If the user's message is intercepted by the system for crisis, respond only with the provided CRITICAL SAFETY RULES text to ensure the most urgent information is delivered.
5.  **Keep it Conversational**: Keep your responses concise (2-3 sentences) to maintain a natural, spoken conversation flow.
"""

CRISIS_MESSAGE = """
I'm really concerned about what you're sharing. Your safety is the most important thing. Please contact emergency services immediately or reach out to a crisis helpline:
- US/Canada: Call/text 988
- India: 9152987821 or 022-27546669
- UK: 116 123
- International: Find your local crisis line at findahelpline.com

Please remember I am an AI companion, not a replacement for professional care.
"""
SAFETY_KEYWORDS = [
    r'\bkill myself\b', r'\bend my life\b', r'\bcommit suicide\b', r'\bi want to die\b', 
    r'\btake my own life\b', r'\bharm myself\b', r'\bself harm\b', r'\bfirearm\b', r'\bpills\b'
]
SAFETY_PATTERN = re.compile('|'.join(SAFETY_KEYWORDS), re.IGNORECASE)

# --- 3. FastAPI Initialization & Middleware (Mostly Unchanged) ---

app = FastAPI(
    title="MannSahay Voice Backend",
    description="Handles chat logic and text-to-speech generation."
)

# 3.1. Configure CORS and Gzip
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3.2. Configure Rate Limiter (Slo-API)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 3.3. Configure Google AI & **TTS Client**
try:
    genai.configure(api_key=settings.google_api_key)
    print("Google AI client configured successfully.")
    # --- NEW: Initialize the official dedicated TTS Client ---
    tts_client = texttospeech.TextToSpeechAsyncClient()
    # ---------------------------------------------------------
except Exception as e:
    print(f"FATAL ERROR: Failed to configure Google AI/TTS client: {e}")
    raise SystemExit(f"Configuration failed: {e}")

# 3.4. Initialize the Generative Models
text_model = genai.GenerativeModel(
    'gemini-2.5-flash',
    system_instruction=MANNASAHAY_PROMPT
)
# --- REMOVE OR COMMENT OUT THIS LINE ---
# tts_model = genai.GenerativeModel('gemini-2.5-flash-preview-tts')
# ---------------------------------------


# --- 4. Data Models and Validation (Unchanged) ---
class ChatRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=settings.max_message_length)
    userId: str = Field(..., min_length=1, max_length=100)
    
    @validator('text')
    def validate_text(cls, v):
        blocked_phrases = ["<script>", "javascript:", "onload="]
        for phrase in blocked_phrases:
            if phrase in v.lower():
                raise ValueError('Invalid input detected.')
        return v.strip()

class ChatResponse(BaseModel):
    responseText: str
    audioBase64: str


# --- 5. Session Management and Cleanup (Unchanged) ---
class UserSession:
    def __init__(self, chat_session: ChatSession):
        self.chat_session = chat_session
        self.last_activity = datetime.now()
        self.message_count = 0

user_sessions: Dict[str, UserSession] = {}

def get_or_create_session(user_id: str) -> ChatSession:
    if user_id not in user_sessions:
        print(f"Starting new chat session for user: {user_id}")
        user_sessions[user_id] = UserSession(
            chat_session=text_model.start_chat(history=[]))
    
    session = user_sessions[user_id]
    session.last_activity = datetime.now()
    session.message_count += 1
    return session.chat_session

async def cleanup_old_sessions():
    await asyncio.sleep(300) 
    print("Starting periodic session cleanup...")
    while True:
        await asyncio.sleep(3600)  # Run every hour
        now = datetime.now()
        timeout = timedelta(hours=settings.session_timeout_hours)
        expired_users = [
            user_id for user_id, session in user_sessions.items()
            if now - session.last_activity > timeout
        ]
        
        for user_id in expired_users:
            del user_sessions[user_id]
            print(f"Cleaned up expired session for user: {user_id}")
            
# Register the cleanup task on startup
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_old_sessions())


# --- 6. Core TTS Generation Function (FIXED) ---
async def generate_speech(text: str) -> bytes:
    """
    Generates speech using the official Google Cloud Text-to-Speech API.
    """
    synthesis_input = texttospeech.SynthesisInput(text=text)

    # Use a professional, calm, female voice for a companion persona
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Standard-C" # Clear, high-quality standard voice
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    try:
        # Use the global tts_client initialized in section 3.3
        tts_response = await tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        return tts_response.audio_content
    except Exception as e:
        # This will now catch permission errors or other official API issues
        print(f"Official TTS generation failed for text: '{text[:30]}...' Error: {e}")
        return b""

# --- 7. API Endpoints (Unchanged) ---
@app.get("/")
def read_root():
    return {"status": "MannSahay Backend is running!"}

@app.get("/health")
async def health_check():
    try:
        # Test Gemini API connectivity
        test_model = genai.GenerativeModel('gemini-2.5-flash')
        test_response = await test_model.generate_content_async("ping")
        
        if not test_response.text:
            raise Exception("API returned empty response.")
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "active_sessions": len(user_sessions),
            "api_connectivity": "ok"
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Service unhealthy: Gemini API check failed: {e}")


@app.post("/api/chat-voice", response_model=ChatResponse)
@limiter.limit("10/minute") # Apply rate limiting
async def handle_chat_voice(request: Request, chat_request: ChatRequest):
    try:
        user_input = chat_request.text
        
        # --- 1. Safety Check (Pre-LLM Override) ---
        if SAFETY_PATTERN.search(user_input):
            gemini_text = CRISIS_MESSAGE
            print(f"SAFETY OVERRIDE TRIGGERED for user: {chat_request.userId}")
        else:
            # --- 2. Get LLM Response ---
            chat_session = get_or_create_session(chat_request.userId)
            response = await chat_session.send_message_async(user_input)
            gemini_text = response.text
        
        # --- 3. Get Audio Response (TTS) ---
        audio_bytes = await generate_speech(gemini_text)
        
        if not audio_bytes:
            # This will now correctly trigger if the official TTS API fails
            raise Exception("Failed to generate audio content.") 
        
        # --- 4. Encode and Send Response ---
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return ChatResponse(
            responseText=gemini_text,
            audioBase64=audio_base64
        )

    except RateLimitExceeded:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
            detail="Rate limit exceeded. Try again in a minute."
        )
    except HTTPException:
        raise # Re-raise explicit HTTPExceptions
    except Exception as e:
        print(f"An unexpected error occurred during chat processing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Internal Server Error: {e}"
        )

# --- Run the Server (Unchanged) ---

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting MannSahay backend on port {settings.server_port} ...")
    uvicorn.run(app, host="0.0.0.0", port=settings.server_port)

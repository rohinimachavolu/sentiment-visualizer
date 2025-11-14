# backend/main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscriptRequest(BaseModel):
    text: str

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.post("/process_text")
async def process_text(request: TranscriptRequest):
    try:
        # Add timeout wrapper for Groq API call
        async def call_groq_with_timeout():
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are an advanced emotion analyzer. Analyze the text and classify it into one of these 9 emotions:

- "sad": feeling down, depressed, unhappy, melancholic, disappointed
- "happy": feeling joyful, content, pleased, delighted, cheerful
- "angry": feeling mad, furious, irritated, rage, frustrated
- "calm": feeling peaceful, relaxed, serene, tranquil, composed
- "confused": feeling uncertain, bewildered, unclear, puzzled, lost
- "confident": feeling assured, certain, self-assured, determined, strong
- "love": feeling affectionate, caring, warm, loving, adoring
- "surprise": feeling shocked, amazed, astonished, startled, unexpected
- "fear": feeling scared, anxious, worried, afraid, nervous

Return ONLY valid JSON with no additional text:
{
  "emotion": "<one of: sad, happy, angry, calm, confused, confident, love, surprise, fear>",
  "intensity": <float 0.0-1.0 indicating strength of emotion>,
  "keywords": [<array of 3-5 most important words>]
}"""
                        },
                        {
                            "role": "user",
                            "content": f"Analyze this transcript: \"{request.text}\""
                        }
                    ],
                    temperature=0.3,
                    max_tokens=200,
                    response_format={"type": "json_object"}
                )
            )
        
        # Set 10 second timeout for AI API call
        chat_completion = await asyncio.wait_for(
            call_groq_with_timeout(),
            timeout=10.0
        )
        
        response_text = chat_completion.choices[0].message.content
        result = json.loads(response_text)
        
        print(f"✓ Analyzed: Emotion={result.get('emotion')}, Intensity={result.get('intensity')}, Keywords={result.get('keywords')}")
        
        if not all(key in result for key in ["emotion", "intensity", "keywords"]):
            raise ValueError("Invalid response structure")
        
        return result
        
    except asyncio.TimeoutError:
        print(f"⏱️ Groq API timeout after 10s for text: '{request.text}'")
        # Return default values on timeout
        return {
            "emotion": "calm",
            "intensity": 0.5,
            "keywords": ["timeout"],
            "error": "API timeout"
        }
        
    except Exception as e:
        print(f"❌ Error processing text: {str(e)}")
        return {
            "emotion": "calm",
            "intensity": 0.5,
            "keywords": ["error"],
            "error": str(e)
        }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Add middleware to log slow requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    if process_time > 5:
        print(f"⚠️ Slow request: {request.url.path} took {process_time:.2f}s")
    else:
        print(f"✓ Request: {request.url.path} took {process_time:.2f}s")
    
    return response
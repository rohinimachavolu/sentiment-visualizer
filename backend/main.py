# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sentiment-frontend-vppb.onrender.com",
        "https://*.onrender.com"  # Allow all Render domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscriptRequest(BaseModel):
    text: str

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.post("/process_text")
async def process_text(request: TranscriptRequest):
    try:
        # Use Groq API
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast and good quality
            messages=[
                {
                    "role": "system",
                    "content": """You are a sentiment analyzer. Return ONLY valid JSON with no additional text or markdown.
The JSON must have this exact structure:
{
  "sentiment": <float between -1.0 (very negative) and 1.0 (very positive)>,
  "intensity": <float between 0.0 (calm/neutral) and 1.0 (very intense/emotional)>,
  "keywords": [<array of 2-5 most important words or short phrases that actually effects the sentiment>]
}"""
                },
                {
                    "role": "user",
                    "content": f"Analyze this transcript: \"{request.text}\""
                }
            ],
            temperature=0.3,
            max_tokens=200,
            response_format={"type": "json_object"}  # Groq supports JSON mode!
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # Parse JSON response
        result = json.loads(response_text)
        
        # DEBUG: Print what we're sending back
        print(f"Backend sending: Sentiment={result.get('sentiment')}, Intensity={result.get('intensity')}, Keywords={result.get('keywords')}")
        
        if not all(key in result for key in ["sentiment", "intensity", "keywords"]):
            raise ValueError("Invalid response structure")
        
        return result
        
    except Exception as e:
        print(f"Error processing text: {str(e)}")
        return {
            "sentiment": 0.0,
            "intensity": 0.5,
            "keywords": ["error"],
            "error": str(e)
        }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
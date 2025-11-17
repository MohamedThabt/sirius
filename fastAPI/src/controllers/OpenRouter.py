import requests
import json
import os
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

def ask_openrouter(prompt: str) -> str:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000", 
        "X-Title": "My FastAPI App",              
    }
    data = {
        "model": "x-ai/grok-4-fast:free",  
        "messages": [
            {"role": "user", "content": [{"type": "text", "text": prompt}]}
        ]
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    result = response.json()

    
    try:
        return result["choices"][0]["message"]["content"]
    except Exception:
        return str(result) 

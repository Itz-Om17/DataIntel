import os
import traceback
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

# Force clear any proxy settings that might interfere
os.environ.pop("HTTP_PROXY", None)
os.environ.pop("HTTPS_PROXY", None)
os.environ.pop("http_proxy", None)
os.environ.pop("https_proxy", None)

MODEL_NAME = "llama-3.1-8b-instant"

_groq_client = None

def get_groq_client():
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY", "").strip()
        if not api_key:
            raise Exception("GROQ_API_KEY is missing from environment")
        _groq_client = AsyncGroq(api_key=api_key)
    return _groq_client

async def close_groq_client():
    global _groq_client
    if _groq_client is not None:
        await _groq_client.close()
        _groq_client = None

async def call_llama(prompt: str) -> str:
    client = get_groq_client()
    try:
        print(f"--- Calling Llama ---")
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1024,
        )
        print(f"--- Llama Response Received ---")
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        traceback.print_exc()
        raise Exception(f"Groq Async request failed: {str(e)}")
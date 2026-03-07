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

async def call_llama(prompt: str) -> str:
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        raise Exception("GROQ_API_KEY is missing from environment")

    # Use a context manager to ensure the client is closed
    async with AsyncGroq(api_key=api_key) as client:
        try:
            response = await client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1024,
            )
            return response.choices[0].message.content
        except Exception as e:
            traceback.print_exc()
            raise Exception(f"Groq Async request failed: {str(e)}")
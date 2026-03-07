import os
from groq import Groq

# Load from environment (set GROQ_API_KEY in .env or system env)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

MODEL_NAME = "llama-3.1-8b-instant"  # Free, fast Llama 3 via Groq

client = Groq(api_key=GROQ_API_KEY)

def call_llama(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq request failed: {str(e)}")
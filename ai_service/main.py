from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os

app = FastAPI()

# Allow frontend/backend origins from env, fallback to all
origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ai/test")
def test_ai():
    print("hii from AI service 🤖")
    return {"message": "AI received"}

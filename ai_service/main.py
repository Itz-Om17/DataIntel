from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import os

# Load environment variables (like GROQ_API_KEY) before importing other modules
load_dotenv()

from sql_generator import generate_sql
from explanation_generator import generate_explanation

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

class SQLRequest(BaseModel):
    db_schema: str
    question: str
    table_name: str

class ExplanationRequest(BaseModel):
    question: str
    result: list

@app.post("/ai/test")
def test_ai():
    print("hii from AI service 🤖")
    return {"message": "AI received"}

@app.post("/generate-sql")
async def generate_sql_endpoint(req: SQLRequest):
    try:
        sql = await generate_sql(req.db_schema, req.question, req.table_name)
        return {"sql": sql}
    except Exception as e:
        print(f"SQL generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-explanation")
async def generate_explanation_endpoint(req: ExplanationRequest):
    try:
        explanation = await generate_explanation(req.question, req.result)
        return {"explanation": explanation}
    except Exception as e:
        print(f"Explanation generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    from model import close_groq_client
    await close_groq_client()
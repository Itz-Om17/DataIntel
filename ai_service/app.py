from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables (like GROQ_API_KEY) before importing other modules
load_dotenv()

from sql_generator import generate_sql
from explanation_generator import generate_explanation

app = FastAPI()

class SQLRequest(BaseModel):
    db_schema: str
    question: str
    table_name: str

class ExplanationRequest(BaseModel):
    question: str
    result: list

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
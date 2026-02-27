from fastapi import FastAPI
from pydantic import BaseModel
from sql_generator import generate_sql
from explanation_generator import generate_explanation

app = FastAPI()

class SQLRequest(BaseModel):
    schema: str
    question: str
    table_name: str

class ExplanationRequest(BaseModel):
    question: str
    result: list

@app.post("/generate-sql")
def generate_sql_endpoint(req: SQLRequest):
    print(req.schema)
    sql = generate_sql(req.schema, req.question, req.table_name)
    
    return {"sql": sql}

@app.post("/generate-explanation")
def generate_explanation_endpoint(req: ExplanationRequest):
    explanation = generate_explanation(req.question, req.result)
    return {"explanation": explanation}
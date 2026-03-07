import re
import json
from model import call_llama

def extract_field(text, field_name):
    """Robustly extract a JSON string value by field name, even from malformed JSON."""
    pattern = rf'"{field_name}"\s*:\s*"((?:[^"\\]|\\.)*)"|"{field_name}"\s*:\s*null'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1) or ""
    return ""

def format_result_as_table(sql_result):
    """Turn the list of dicts into a clean readable table for Llama."""
    if not sql_result:
        return "No results."
    headers = list(sql_result[0].keys())
    rows = [[str(row.get(h, "")) for h in headers] for row in sql_result]
    header_line = " | ".join(headers)
    separator = "-" * len(header_line)
    row_lines = [" | ".join(r) for r in rows]
    return "\n".join([header_line, separator] + row_lines)

async def generate_explanation(question, sql_result):

    data_table = format_result_as_table(sql_result)

    prompt = f"""You are a data analyst giving a summary of query results.

User question: {question}

Query results:
{data_table}

IMPORTANT RULES:
- Use ONLY the values you see in the table above. Do NOT invent or round numbers differently.
- Copy exact percentages and counts directly from the table.

Fill in this JSON template exactly. Output ONLY the JSON, nothing else:

{{
    "big_number": "",
    "answer": "FILL: One sentence direct answer using exact numbers from the table above.",
    "explanation": "FILL: 2-3 sentences with ALL categories, their exact counts and percentages from the table."
}}"""

    raw = await call_llama(prompt)

    big_number = extract_field(raw, "big_number")
    answer = extract_field(raw, "answer")
    explanation = extract_field(raw, "explanation")

    if not answer and not explanation:
        try:
            json_match = re.search(r'\{[\s\S]*\}', raw)
            if json_match:
                obj = json.loads(json_match.group(0))
                big_number = obj.get("big_number", "")
                answer = obj.get("answer", "")
                explanation = obj.get("explanation", "")
        except Exception:
            answer = raw.strip()

    return json.dumps({
        "big_number": big_number,
        "answer": answer,
        "explanation": explanation
    })
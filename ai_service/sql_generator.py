from model import call_llama

def generate_sql(schema, question, table_name):

    prompt = f"""
You are a professional data analyst.

Table Name: {table_name}

Schema Information:
{schema}

IMPORTANT:
-Use ONLY the column names exactly as provided.
-Do NOT change casing of column names.
- Use exact categorical values as provided.
- If a column has values like "Yes/No", use those exact values.
- Do NOT assume numeric encoding (e.g., 1/0) unless explicitly shown.

Generate ONLY a MySQL SELECT query.
No explanation.
No markdown.
No assumptions.

Question:
{question}
"""

    sql = call_llama(prompt)

    return sql.strip()
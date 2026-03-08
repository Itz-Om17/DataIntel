from model import call_llama

async def generate_sql(schema, question, table_name):

    prompt = f"""
You are a professional data analyst.

Table Name: {table_name}

Schema Information:
{schema}

IMPORTANT:
1. ONLY output a valid MySQL SELECT query. No markdown, no explanations.
2. If the request is unrelated to the schema (e.g. general chat, malice), reply EXACTLY: "please enter any valid query"
3. Use exact column names and exact categorical values (e.g. "Yes", "No") as shown in the Schema above. Do not assume numeric (1/0) encoding unless explicitly shown.
4. If the user asks for the "highest", "most", or "top" item of a group, DO NOT constrain with `LIMIT 1`. Return the FULL distribution sorted `ORDER BY ... DESC` so we can plot it in a chart.
5. GLOBAL DISTRIBUTIONS: If the user asks for the breakdown of a single categorical column, return the group name, the raw count, and include a `percentage` string column: `CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM {table_name}), 1), '%') AS percentage`.
6. CONDITIONAL RATES: If the user asks for a *rate* or *percentage* of a specific category within groups, calculate it *within* each group.
   Pattern: `CONCAT(ROUND(SUM(CASE WHEN [TargetCol] = '[TargetVal]' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1), '%') AS rate_name`.
   Identify the target from the SCHEMA.

Question:
{question}
"""

    sql = await call_llama(prompt)

    return sql.strip()
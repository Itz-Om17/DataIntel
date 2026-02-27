from model import call_llama

def generate_explanation(question, sql_result):

    prompt = f"""
You are a business intelligence assistant.

Given the user's question:
{question}

And the following query result:
{sql_result}

Generate a clear business explanation.
Use only the provided data.
Do not assume anything.
Do not calculate new values.
"""

    explanation = call_llama(prompt)

    return explanation.strip()
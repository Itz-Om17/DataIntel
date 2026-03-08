import json
from model import call_llama

async def suggest_report_relationships(schema_str: str, sample_data_str: str):
    prompt = f"""
    You are a data science expert. Given the following database schema and a small sample of data, suggest 5-6 interesting relationships for visualization in a business report.
    
    The visualization will include Area Charts and Bar Charts. 
    - Area/Bar charts need an X-Axis (usually a category or time-based string) and a Y-Axis (a numeric value).
    - Pie charts need a single categorical column for distribution.

    SCHEMA:
    {schema_str}

    SAMPLE DATA (FIRST FEW ROWS):
    {sample_data_str}

    Output ONLY a JSON array of objects. Each object must have:
    - "label": A human-readable title for the suggestion (e.g., "Revenue by Location")
    - "x": The exact column name for the X-axis (must be a categorical string or time)
    - "y": The exact column name for the Y-axis (MUST be a numeric column like price, count, tenure, or charges. DO NOT use columns with Yes/No or non-numeric values for Y)
    - "type": either "trend" (for area chart) or "comparison" (for bar chart)

    Example Format:
    [
        {{"label": "Monthly Charges by Gender", "x": "gender", "y": "MonthlyCharges", "type": "comparison"}},
        ...
    ]
    """
    
    try:
        response = await call_llama(prompt)
        # Clean response if it contains markdown
        if "```json" in response:
            response = response.split("```json")[-1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[-1].split("```")[0].strip()
            
        return json.loads(response)
    except Exception as e:
        print(f"Error suggesting relationships: {e}")
        return []

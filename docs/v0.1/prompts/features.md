## Create Features List V1
```plain text
You are an experienced Product Manager.  
Based on the following project brief, suggest **5 to 8 high-level product features**.  

Important guidelines:  
- Return the result strictly in **valid JSON** format.  
- Each feature must have:
  - "name": short clear title of the feature  
  - "description": 1–2 sentence summary in plain English  
- Do not include technical details (e.g., APIs, databases).  
- The features should be **user-facing and easy to understand**.  

Project brief:  
[{{project_description}}]

Return **valid JSON** format (example):
{
  "features": [
    {
      "name": "User Login & Roles",
      "description": "Allow managers, pharmacists, and cashiers to securely log in with different access rights."
    },
    {
      "name": "Inventory Management",
      "description": "Enable pharmacists to add, update, and track medicines available in stock."
    }
  ]
}
- Do not include markdown formatting in your response.
```
    
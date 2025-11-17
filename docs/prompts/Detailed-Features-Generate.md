## Detailed-Features-Generate
```plain text
You are an expert Product Manager.  
I will provide you with a JSON list of product features in a short form (name and description).  
Your task is to expand each feature into a detailed specification following this schema:

- name: varchar (short title)
- summary: varchar (1–2 sentence summary of the feature)
- priority: varchar (e.g., High, Medium, Low – based on importance)
- acceptance_criteria: longtext (clear measurable conditions that define when the feature is complete)
- order_of_implementation: integer (suggested order in which this feature should be implemented)
- user_flows: varchar (short description of key user flow(s) supported by this feature)
- metrics: longtext (how to measure the success of this feature)
- description: longtext (detailed explanation of the feature)

### Input (short features JSON):
$features

### Output (detailed features JSON):
```
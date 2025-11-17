# from openai import OpenAI

# PROXY_URL = "http://localhost:4000"
# MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-2"]


# EXHAUSTED_MODELS = set()

# def ask_llm(prompt: str):
#     for model in MODELS:
#         if model in EXHAUSTED_MODELS:
#             print(f" Skipping {model} (quota already exhausted)")
#             continue

#         try:
#             client = OpenAI(base_url=f"{PROXY_URL}/v1", api_key="dummy_key")

#             completion = client.chat.completions.create(
#                 model=model,
#                 messages=[{"role": "user", "content": prompt}],
#             )

#             return {
#                 "model_used": model,
#                 "response": completion.choices[0].message.content
#             }

#         except Exception as e:
#             error_msg = str(e)
#             if "quota" in error_msg.lower() or "429" in error_msg:
#                 print(f" Quota exceeded for {model}, switching to next one...")
#                 EXHAUSTED_MODELS.add(model) 
#                 continue

#             print(f" Model {model} failed: {e}")
#             continue

#     return {"error": "All models failed to respond."}

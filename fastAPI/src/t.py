from openai import OpenAI

client = OpenAI(base_url="http://localhost:4000", api_key="anykey")

models = client.models.list()
print([m.id for m in models.data])

import os

def load_prompt(filename: str) -> str:
    base_path = os.path.join(os.path.dirname(__file__), "..", "Prompts")
    file_path = os.path.join(base_path, filename)

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

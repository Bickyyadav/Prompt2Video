from llm import process, generate_code, render_videos, all_scene_oneplace
import os

def trigger_process(id: str, prompt: str):
    """
    Function that accepts id and prompt from the user and calls process.
    """
    memory = process(id, prompt)
    generate_code(memory, topic=prompt)
    render_videos()
    all_scene_oneplace()


if __name__ == "__main__":
    # Example usage
    user_id = os.getenv("USER_ID")
    user_prompt = os.getenv("USER_PROMPT")
    trigger_process(user_id, user_prompt)

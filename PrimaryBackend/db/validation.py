from pydantic import BaseModel

class PromptRequest(BaseModel):
    prompt: str


class VideoRequest(BaseModel):
    id: str
    video_url: str   


class AiPromptRequest(BaseModel):
    id: str
    ai_generated_prompt: str



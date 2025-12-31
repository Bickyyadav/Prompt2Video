from pydantic import BaseModel, EmailStr, Field
from beanie import Indexed, PydanticObjectId
from beanie import Document, Indexed, init_beanie,Link, PydanticObjectId
from enum import Enum
from datetime import datetime

class VideoStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Document):
    name: str
    email: EmailStr
    password: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class Prompt(Document):
    # user: Link[User]
    prompt: str
    ai_generated_prompt: str | None = None
    cloudinary_url: str | None = None
    video_status: VideoStatus = VideoStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "prompts"


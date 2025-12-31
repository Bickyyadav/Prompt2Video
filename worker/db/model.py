from beanie import Document
from typing import Optional
from datetime import datetime


class User(Document):
    email: str

    class Settings:
        name = "users"


class Prompt(Document):
    prompt: str
    class Settings:
        name = "prompts"

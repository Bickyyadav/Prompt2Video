import os
from dotenv import load_dotenv
from beanie import init_beanie, PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from db.model import User, Prompt
from typing import Optional

load_dotenv()

client: AsyncIOMotorClient | None = None


async def init_db():
    global client

    mongo_url = os.getenv("MONGODB_URL")
    # print(mongo_url)
    db_name = os.getenv("DB_NAME")
    # print(db_name)

    if not mongo_url or not db_name:
        raise RuntimeError("MONGO_URL or DB_NAME is not set")

    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")

        database = client[db_name]

        await init_beanie(database=database, document_models=[User, Prompt])

        print(" MongoDB connected successfully")
    except Exception as e:
        print(f" MongoDB connection failed: {e}")
        client = None


async def get_prompt_by_id(prompt_id: str) -> Optional[str]:
    try:
        # Check if prompt_id is valid ObjectId
        if not PydanticObjectId.is_valid(prompt_id):
            print(f"Invalid Prompt ID format: {prompt_id}")
            return None

        prompt_doc = await Prompt.get(PydanticObjectId(prompt_id))
        if prompt_doc:
            return prompt_doc.prompt
        return None
    except Exception as e:
        print(f"Error fetching prompt: {e}")
        return None

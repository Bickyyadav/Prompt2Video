import os
from dotenv import load_dotenv
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from db.model import User, Prompt

client: AsyncIOMotorClient | None = None

async def init_db():
    global client

    mongo_url = os.getenv("MONGODB_URL")
    print(mongo_url)
    db_name = os.getenv("DB_NAME")
    print(db_name)

    if not mongo_url or not db_name:
        raise RuntimeError("MONGO_URL or DB_NAME is not set")

    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")

        database = client[db_name]

        await init_beanie(database=database,document_models=[User, Prompt])

        print(" MongoDB connected successfully")
    except Exception as e:
        print(f" MongoDB connection failed: {e}")
        client = None


async def close_db():
    if client:
        client.close()
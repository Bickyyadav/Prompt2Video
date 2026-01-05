import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel
from db.database import init_db
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.prompt import router

load_dotenv()
app = FastAPI()
app.include_router(router)

@app.get("/")
def index():
    return {"message":"hi there"}



@app.on_event("startup")
async def start_db():
    await init_db()

origin=[
    "http://localhost:3000",
    "http://2349a7a1-caa7-4eb3-a28a-5647cf81a9a5.k8s.civo.com",
]    

app.add_middleware(
    CORSMiddleware,
    allow_origins= origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

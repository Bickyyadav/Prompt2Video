from fastapi import APIRouter, HTTPException
from db.validation import PromptRequest, VideoRequest, AiPromptRequest
from db.model import Prompt, VideoStatus
from beanie import PydanticObjectId
from internal_redis.redis_client import r

router = APIRouter()


@router.post("/c/prompt")
async def receive_prompt(request: PromptRequest):
    print(f"Received prompt: {request.prompt}")

    new_prompt = Prompt(prompt=request.prompt)
    await new_prompt.insert()
    # Push the new ID to Redis
    r.lpush("prompt_queue", str(new_prompt.id))

    return {"status": "received", "id": str(new_prompt.id)}


@router.post("/c/video_url")
async def receive_video(request: VideoRequest):
    print(f"Received video: {request.video_url}")
    prompt_data = await Prompt.get(PydanticObjectId(request.id))
    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt not found")

    prompt_data.cloudinary_url = request.video_url
    prompt_data.video_status = VideoStatus.COMPLETED
    await prompt_data.save()

    return {"status": "updated", "id": str(prompt_data.id)}


@router.get("/c/prompt")
async def get_prompt(id: str | None = None):
    if not id:
        raise HTTPException(status_code=400, detail="Missing 'id' query parameter")

    try:
        req_id = PydanticObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    prompt_data = await Prompt.get(req_id)
    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return {"ai_generated_prompt": prompt_data.ai_generated_prompt}

@router.get("/c/cloudinary_url")
async def get_cloudinary_url(id: str | None = None):
    if not id:
        raise HTTPException(status_code=400, detail="Missing 'id' query parameter")

    try:
        req_id = PydanticObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    prompt_data = await Prompt.get(req_id)
    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return {"cloudinary_url": prompt_data.cloudinary_url}

@router.post("/c/ai_generated_prompt")
async def receive_ai_generated_prompt(request: list[AiPromptRequest]):
    if not request:
        raise HTTPException(status_code=400, detail="Invalid input format")

    updated_ids = set()

    for item in request:
        print(f"Received chunk for id {item.id}")

        prompt_data = await Prompt.get(PydanticObjectId(item.id))
        if not prompt_data:
            print(f"Prompt not found for id {item.id}, skipping chunk.")
            continue

        if prompt_data.ai_generated_prompt:
            # Append if already exists. You might want a separator like "\n" or just space
            prompt_data.ai_generated_prompt += "\n" + item.ai_generated_prompt
        else:
            prompt_data.ai_generated_prompt = item.ai_generated_prompt

        await prompt_data.save()
        updated_ids.add(str(prompt_data.id))

    if not updated_ids:
        raise HTTPException(status_code=404, detail="No valid prompts found to update")

    return {"status": "updated", "ids": list(updated_ids)}

import os
import sys
import asyncio
from dotenv import load_dotenv
from kubernetes import client, config
from db.database import init_db, get_prompt_by_id

config.load_kube_config()
batch = client.BatchV1Api()

load_dotenv()

from services.redis_client import r
from services.k8s import create_k8s_job


def main():
    asyncio.run(run_worker())


async def run_worker():
    print("Worker started. Connecting to DB...")
    await init_db()
    print("Worker ready. Waiting for prompts...")

    while True:
        try:
            result = await asyncio.to_thread(r.blpop, "prompt_queue", timeout=0)
            if result:
                queue_name, prompt_id = result
                prompt_id_str = prompt_id
                prompt_text = await get_prompt_by_id(prompt_id_str)
                if prompt_text:
                    print(f"Fetched Prompt: {prompt_text}")
                    try:
                        create_k8s_job(prompt_id_str, prompt_text)
                        print(f"🔴 Created K8s Job for {prompt_id_str}")
                    except Exception as k8s_error:
                        print(f"Failed to create K8s job: {k8s_error}")
                else:
                    print(f"Prompt not found for ID: {prompt_id_str}")

        except Exception as e:
            print(f"Error processing prompt: {e}")
            await asyncio.sleep(1)


if __name__ == "__main__":
    main()

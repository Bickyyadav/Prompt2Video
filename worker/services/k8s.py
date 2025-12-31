from kubernetes import client, config
import os
import uuid


config.load_kube_config()
batch = client.BatchV1Api()


PRIMARY_BACKEND_URL = os.getenv("PRIMARY_BACKEND_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_SECRET_KEY = os.getenv("CLOUDINARY_SECRET_KEY")
BACKEND_URL = os.getenv("BACKEND_URL")


def create_k8s_job(user_id: str, prompt_text: str):
    print("🔴🔴🔴🔴🔴🔴")
    print(user_id)
    print(prompt_text)
    job_name = f"task-{user_id}-{uuid.uuid4().hex[:6]}"
    job = client.V1Job(
        metadata=client.V1ObjectMeta(name=job_name),
        spec=client.V1JobSpec(
            backoff_limit=1,
            template=client.V1PodTemplateSpec(
                spec=client.V1PodSpec(
                    restart_policy="Never",
                    containers=[
                        client.V1Container(
                            name="worker",
                            image="bicky2005/jobscheduler:v1",
                            # resources=client.V1ResourceRequirements(
                            #     requests={"memory": "256Mi", "cpu": "250m"},
                            #     limits={"memory": "512Mi", "cpu": "500m"},
                            # ),
                            env=[
                                client.V1EnvVar(name="USER_ID", value=user_id),
                                client.V1EnvVar(name="USER_PROMPT", value=prompt_text),
                                client.V1EnvVar(
                                    name="PRIMARY_BACKEND_URL",
                                    value=PRIMARY_BACKEND_URL,
                                ),
                                client.V1EnvVar(
                                    name="GEMINI_API_KEY", value=GEMINI_API_KEY
                                ),
                                client.V1EnvVar(
                                    name="CLOUDINARY_CLOUD_NAME",
                                    value=CLOUDINARY_CLOUD_NAME,
                                ),
                                client.V1EnvVar(
                                    name="CLOUDINARY_API_KEY", value=CLOUDINARY_API_KEY
                                ),
                                client.V1EnvVar(
                                    name="CLOUDINARY_SECRET_KEY",
                                    value=CLOUDINARY_SECRET_KEY,
                                ),
                                client.V1EnvVar(name="BACKEND_URL", value=BACKEND_URL),
                                client.V1EnvVar(name="PYTHONUNBUFFERED", value="1"),
                            ],
                        )
                    ],
                )
            ),
        ),
    )
    batch.create_namespaced_job(namespace="default", body=job)


#  kubectl logs -f -l job-name=task-6954df83b30e02f8096c19d8-f699f9

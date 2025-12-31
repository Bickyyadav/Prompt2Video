# import urllib.request
# import json

# BASE_URL = "http://localhost:8000"

# def verify():
#     # 1. Create a prompt
#     print("Creating a prompt...")
#     data = json.dumps({"prompt": "Test prompt for aggregation"}).encode('utf-8')
#     req = urllib.request.Request(f"{BASE_URL}/c/prompt", data=data, headers={'Content-Type': 'application/json'})
    
#     try:
#         with urllib.request.urlopen(req) as response:
#             result = json.loads(response.read().decode('utf-8'))
#             prompt_id = result.get("id")
#             print(f"Created prompt with ID: {prompt_id}")
#     except urllib.error.URLError as e:
#         print(f"Failed to create prompt: {e}")
#         if hasattr(e, 'read'):
#             print(e.read().decode('utf-8'))
#         return

#     # 2. Send chunks
#     chunks = [
#         {"id": prompt_id, "ai_generated_prompt": "Chunk 1 content."},
#         {"id": prompt_id, "ai_generated_prompt": "Chunk 2 content."},
#         {"id": prompt_id, "ai_generated_prompt": "Chunk 3 content."}
#     ]
    
#     print("Sending chunks...")
#     data = json.dumps(chunks).encode('utf-8')
#     req = urllib.request.Request(f"{BASE_URL}/c/ai_generated_prompt", data=data, headers={'Content-Type': 'application/json'})
    
#     try:
#         with urllib.request.urlopen(req) as response:
#             result = json.loads(response.read().decode('utf-8'))
#             print(f"Success: {result}")
#     except urllib.error.URLError as e:
#         print(f"Failed to send chunks: {e}")
#         if hasattr(e, 'read'):
#             print(e.read().decode('utf-8'))

# if __name__ == "__main__":
#     verify()

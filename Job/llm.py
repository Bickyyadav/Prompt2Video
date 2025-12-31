from litellm import completion
import requests
import os
import json
import re
import subprocess
from prompt import system_prompt
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import logging


os.environ['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')
global scene_memory
scene_memory = [] 

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_SECRET_KEY"),
    secure=True,
)

def process(prompt_id: str, text: str, total_chunks: int = 5):
    for chunk_index in range(1, total_chunks + 1):
        print(f"Generating Chunk {chunk_index}/{total_chunks} for topic: {text}")
        previous_scenes_summary = json.dumps(scene_memory) if scene_memory else "EMPTY"
        user_prompt = f"""
        TOPIC: {text}
        CHUNK_INDEX: {chunk_index}
        TOTAL_CHUNKS: {total_chunks}
        PREVIOUS_SCENES_SUMMARY: {previous_scenes_summary}
        TARGET_CHUNK_DURATION_MINUTES: 2
        AUDIENCE_LEVEL: Beginner to intermediate
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        try:
            response = completion(
                model="gemini/gemini-2.0-flash", 
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            print(f"Received Chunk {chunk_index} Response")
            
            # Directly parse and store as dict/object, assuming valid JSON due to response_format
            scene_memory.append(json.loads(content))
            
        except Exception as e:
            print(f"Error generating chunk {chunk_index}: {e}")
            break
    try:
        backend_url = os.getenv("PRIMARY_BACKEND_URL", "http://localhost:8000")
        print("🔴🔴🔴🔴")
        print(f"Backend URL: {backend_url}")
        # url = f""http://"{backend_url}/c/ai_generated_prompt"
        url = f"http://{backend_url}/c/ai_generated_prompt"
        payload = [
            {
                "id": prompt_id,
                "ai_generated_prompt": json.dumps(scene_memory)
            }
        ]
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print(f"Successfully sent generated scenes to backend. Status: {response.status_code}")
        else:
            print(f"bickyFailed to send scenes to backend. Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        print(f"bickyError sending scenes to backend: {e}")

    return scene_memory


def generate_code(scene_memory: list, topic: str = ""):
    code_dir = "code"
    if not os.path.exists(code_dir):
        os.makedirs(code_dir)
        print(f"Created directory: {code_dir}")

    previous_scene = None
    for chunk_data in scene_memory:
        try:
            # chunk_data is already a dict
            scenes = chunk_data.get("scenes", [])
            for scene in scenes:
                scene_id = scene.get("scene_id")
                scene_visual_plan = scene.get("visual_plan")
                scene_narration = scene.get("narration_flow")
                
                print(f"Generating code for scene: {scene_id}")
                
                context_str = ""
                if topic:
                    context_str += f"GLOBAL TOPIC: {topic}\n"
                
                if previous_scene:
                    context_str += f"PREVIOUS SCENE CONTEXT:\n- Title: {previous_scene.get('scene_title', 'Unknown')}\n- Visual Plan: {previous_scene.get('visual_plan', 'N/A')}\n- Narration: {previous_scene.get('narration_flow', 'N/A')}\n"
                else:
                    context_str += "PREVIOUS SCENE CONTEXT: This is the first scene. Start fresh.\n"

                prompt = f"""
                You are a Manim expert. Write a complete Python script using Manim Community Edition to animate the following scene.
                
                CONTEXT:
                {context_str}
                
                CURRENT SCENE DETAILS:
                ID: {scene_id}
                VISUAL PLAN: {scene_visual_plan}
                NARRATION FLOW: {scene_narration}
                
                REQUIREMENTS:
                1. Import manim: `from manim import *`
                2. Create a class inheriting from `Scene`.
                3. Implement the `construct` method.
                4. Ensure result is consistent with the GLOBAL TOPIC and PREVIOUS SCENE CONTEXT. The transition should be logical.
                5. Ensure the animation matches the visual plan and narration flow.
                6. Output ONLY valid Python code. NO markdown formatting. NO backticks. NO explanations. Just the code.
                """
                
                # Update previous scene for next iteration
                previous_scene = scene
                
                response = completion(
                    model="gemini/gemini-2.0-flash",
                    messages=[{"role": "user", "content": prompt}]
                )
                
                code_content = response.choices[0].message.content
                
                # This removes any empty lines or spaces at the very beginning or end of the text.
                clean_code = code_content.strip()
                # Why? Even though we told the LLM "NO markdown", sometimes LLMs still wrap code in blocks like:
                # lines = clean_code.split('\n'): Breaks the text into a list of individual lines.
                # lines[1:]: Removes the first line (the ```python part).
                # lines[:-1]: Removes the last line (the closing ``` part).
                # "\n".join(lines): Puts the remaining lines back together into one clean piece of code.
                if clean_code.startswith("```"):
                     lines = clean_code.split('\n')
                     if lines[0].startswith("```"): lines = lines[1:]
                     if lines and lines[-1].startswith("```"): lines = lines[:-1]
                     clean_code = "\n".join(lines)
                
                file_path = os.path.join(code_dir, f"{scene_id}.py")
                with open(file_path, "w") as f:
                    f.write(clean_code)
                print(f"Saved code to {file_path}")
                
        except Exception as e:
            print(f"Error processing chunk: {e}")

def fix_manim_code(code_content: str, error_message: str):
    """
    Calls the LLM to fix the Manim code based on the error message.
    """
    print("Requesting LLM to fix the code...")
    
    prompt = f"""
    SYSTEM ROLE:
    You are a senior Python engineer and Manim Community (v0.18+ / v0.19+) expert.
    You specialize in fixing Manim compilation and runtime errors.
    
    TASK:
    The Manim code below FAILED during execution.
    Your job is to FIX the code so that it runs successfully.
    
    BROKEN MANIM CODE:
    {code_content}
    
    ERROR OUTPUT:
    {error_message}
    
    STRICT RULES (NON-NEGOTIABLE):
    1. Fix ONLY what is required to resolve the error.
    2. Do NOT change the intended animation or scene logic.
    3. Do NOT simplify, shorten, or rewrite the animation unless required.
    4. Preserve scene structure, class names, and animation flow.
    5. Ensure compatibility with Manim Community Edition.
    6. Import all missing modules explicitly.
    7. Ensure the final code runs without syntax or runtime errors.
    
    OUTPUT FORMAT (CRITICAL):
    - Output ONLY valid Python code.
    - NO markdown
    - NO backticks
    - NO explanations
    - NO comments unless required for Python syntax
    - The output MUST start with imports or code immediately.
    
    Return the fixed Python code now.
    """

    try:
        response = completion(
            model="gemini/gemini-2.0-flash",
            messages=[{"role": "user", "content": prompt}]
        )
        code_content = response.choices[0].message.content
        
        # Clean up code
        clean_code = code_content.strip()
        if clean_code.startswith("```"):
             lines = clean_code.split('\n')
             if lines[0].startswith("```"): lines = lines[1:]
             if lines and lines[-1].startswith("```"): lines = lines[:-1]
             clean_code = "\n".join(lines)
             
        return clean_code
    except Exception as e:
        print(f"Error calling LLM for fix: {e}")
        return code_content # Return original if fix fails to generate

def render_videos():
    code_dir = "code"
    video_dir = "video"
    
    if not os.path.exists(code_dir):
        print(f"Code directory '{code_dir}' does not exist.")
        return

    if not os.path.exists(video_dir):
        os.makedirs(video_dir)
        print(f"Created directory: {video_dir}")

    # Iterate over all .py files in the code directory
    for filename in os.listdir(code_dir):
        if filename.endswith(".py"):
            file_path = os.path.join(code_dir, filename)
            
            # Read content to find the scene class name
            try:
                # Retry loop
                max_retries = 3
                for attempt in range(max_retries + 1):
                    with open(file_path, "r") as f:
                        content = f.read()
                    
                    # Regex to find 'class ClassName(Scene):'
                    match = re.search(r"class\s+(\w+)\(Scene\):", content)
                    if match:
                        scene_class_name = match.group(1)
                        # output_name = os.path.splitext(filename)[0] 
                        
                        print(f"Rendering {filename} (Attempt {attempt+1}/{max_retries+1}) ...")
                        
                        cmd = [
                            "manim", 
                            "-qm", 
                            "--disable_caching", 
                            "--media_dir", video_dir,
                            file_path, 
                            scene_class_name
                        ]
                        
                        try:
                            # Capture stderr to use for fixing
                            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
                            print(f"Successfully rendered {filename}")
                            break # Success, break retry loop
                            
                        except subprocess.CalledProcessError as e:
                            print(f"Error rendering {filename}: {e}")
                            print(f"STDERR: {e.stderr}")
                            
                            if attempt < max_retries:
                                print(f"Attempting to fix {filename}...")
                                fixed_code = fix_manim_code(content, e.stderr)
                                
                                # Overwrite the file with fixed code
                                with open(file_path, "w") as f:
                                    f.write(fixed_code)
                                print(f"Overwrote {filename} with fixed code.")
                            else:
                                print(f"Failed to render {filename} after {max_retries+1} attempts.")
                    else:
                        print(f"No Scene class found in {filename}")
                        break
                    
            except Exception as e:
                print(f"Unexpected error processing {filename}: {e}")


def all_scene_oneplace():
    # Manim output structure with -qm is usually: video/videos/SceneName/720p30/SceneName.mp4
    # But user mentioned folders like chunk_1_scene_1 etc.
    # We will search recursively in 'video/videos' (or just 'video' to be safe)
    video_search_dir = os.path.join("video", "videos")
    output_file = "final_video.mp4"
    
    if not os.path.exists(video_search_dir):
        print(f"Video directory '{video_search_dir}' does not exist.")
        return

    mp4_files = []
    
    print(f"Searching for MP4 files in {video_search_dir}...")
    for root, dirs, files in os.walk(video_search_dir):
        for file in files:
            if file.endswith(".mp4"):
                # Avoid adding the output file if it exists there
                if file == output_file:
                    continue
                    
                full_path = os.path.join(root, file)
                
                # To sort correctly, we need to extract chunk and scene numbers from the path or filename.
                # User mentioned folders like 'chunk_1_scene_1'.
                # Let's check the full path for these patterns.
                norm_path = full_path.replace(os.sep, "/")
                
                # Default sort keys
                chunk_idx = 9999
                scene_idx = 9999
                
                # RegEx to find 'chunk_X' and 'scene_Y' patterns (case insensitive)
                chunk_match = re.search(r"chunk_?(\d+)", norm_path.lower())
                scene_match = re.search(r"scene_?(\d+)", norm_path.lower())
                
                if chunk_match:
                    chunk_idx = int(chunk_match.group(1))
                if scene_match:
                    scene_idx = int(scene_match.group(1))
                    
                # Store
                mp4_files.append({
                    "path": full_path,
                    "chunk": chunk_idx,
                    "scene": scene_idx
                })
    
    if not mp4_files:
        print("No MP4 files found to concatenate.")
        return

    # Sort primarily by chunk, then by scene
    mp4_files.sort(key=lambda x: (x["chunk"], x["scene"]))
    
    print("Found the following clips in order:")
    for item in mp4_files:
        print(f" - Chunk {item['chunk']}, Scene {item['scene']}: {item['path']}")
    
    # Create concat file for ffmpeg
    concat_list_path = "concat_list.txt"
    with open(concat_list_path, "w") as f:
        for item in mp4_files:
            # FFMPEG concat format: file 'path/to/file.mp4'
            safe_path = item["path"].replace("\\", "/")
            f.write(f"file '{safe_path}'\n")
            
    print(f"Created {concat_list_path}. Starting FFMPEG...")
    
    # Run FFMPEG
    cmd = [
        "ffmpeg",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        "-y", # Overwrite output
        output_file
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Successfully created full video: {output_file}")
        result =cloudinary.uploader.upload(output_file,folder="prompt2video", use_filename=True,
            resource_type="auto")
        secure_url = result.get("secure_url")
        try:
            backend_url = os.getenv("PRIMARY_BACKEND_URL", "http://localhost:8000")
            url = f"{backend_url}/c/video_url"
            print("👌👌👌👌👌👌👌👌👌")
            payload = {
                "id": os.getenv("USER_ID"),
                "video_url": secure_url
            }
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print(f"Successfully added video url to database. Status: {response.status_code}")
            else:
                print(f"Failed to add video url to database. Status: {response.status_code}, Body: {response.text}")
        except Exception as e:
            print(f"Error adding video url to database: {e}")
        print(f"Uploaded recording to Cloudinary: {secure_url}")
    except subprocess.CalledProcessError as e:
        print(f"Error running FFMPEG: {e}")
    except FileNotFoundError:
        print("FFMPEG executable not found on PATH. Please install FFmpeg.")
        
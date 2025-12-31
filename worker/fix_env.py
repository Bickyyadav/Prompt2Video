import re
import os

def fix_env_file(filepath=".env"):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return

    print(f"Reading {filepath}...")
    with open(filepath, "r") as f:
        content = f.read()

    new_content = re.sub(r"(^|\n)([\w_]+)=[\"\'](.*?)[\"\']", r"\1\2=\3", content)

    if content != new_content:
        print("Found quotes in .env file. Removing them...")
        with open(filepath, "w") as f:
            f.write(new_content)
        print("Fixed .env file.")
    else:
        print("No quotes found in .env file around values.")

if __name__ == "__main__":
    fix_env_file()

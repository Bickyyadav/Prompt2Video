"""Basic connection example.
"""

import redis
import os
REDIS_URL = os.getenv("REDIS_URL")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

r = redis.Redis(
    host=REDIS_URL,
    port=REDIS_PORT,
    decode_responses=True,
    username="default",
    password=REDIS_PASSWORD,
)
print("redis connected🔴🔴🔴🔴🔴🔴")


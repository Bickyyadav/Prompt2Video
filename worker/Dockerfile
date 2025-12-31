FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY pyproject.toml uv.lock ./

# Install dependencies and --frozen: Sync exactly from uv.lock and --no-dev: Exclude development dependencies (optional, remove if needed)
RUN uv sync --frozen --no-dev

COPY . .

# Create a non-root user for security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

CMD ["uv", "run", "main.py"]



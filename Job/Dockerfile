FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

# Install build dependencies for compiling pycairo (Manim dependency)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

RUN uv sync --frozen --no-install-project --no-dev

FROM python:3.12-slim
WORKDIR /app

# Install system dependencies for Manim and FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    pkg-config \
    python3-dev \
    gcc \
    texlive \
    texlive-latex-extra \
    texlive-fonts-extra \
    texlive-latex-recommended \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

COPY . .
EXPOSE 8000
CMD ["python", "main.py"]

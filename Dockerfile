FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Chromium, FFmpeg, Xvfb, Openbox, PulseAudio, Vietnamese fonts & Emoji, Python for Edge Neural TTS
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    procps \
    ffmpeg \
    xvfb \
    openbox \
    xdotool \
    x11-utils \
    pulseaudio \
    pulseaudio-utils \
    dbus \
    dbus-x11 \
    chromium \
    python3 \
    python3-pip \
    fontconfig \
    fonts-roboto \
    fonts-noto-color-emoji \
    fonts-dejavu-core \
    fonts-liberation \
    && pip3 install --no-cache-dir --break-system-packages "edge-tts>=7.3.0" \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user so PulseAudio and Chromium run cleanly
RUN useradd -m -s /bin/bash streamer

WORKDIR /app

# Install original Node.js dependencies without modifying package files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy original repository files untouched + streaming & AI TTS wrapper files
COPY . .

# Ensure Unix LF line endings, executable permissions, and ownership for server.js writes (.env, tracks/, gifts.json)
RUN sed -i 's/\r$//' /app/start-stream.sh /app/tts-engine.py /app/tts-proxy.js \
    && chmod +x /app/start-stream.sh /app/tts-engine.py /app/tts-proxy.js \
    && chown -R streamer:streamer /app /home/streamer

USER streamer

ENV DISPLAY=:99 \
    STREAM_WIDTH=720 \
    STREAM_HEIGHT=1280 \
    STREAM_FPS=30 \
    VIDEO_BITRATE=2500k \
    VIDEO_BUFSIZE=5000k \
    AUDIO_BITRATE=128k \
    X264_PRESET=veryfast \
    STREAM_URL_QUERY=mock=0 \
    TTS_ENGINE=edge \
    TTS_VOICE=vi-VN-HoaiMyNeural \
    TTS_RATE=+5% \
    TTS_ENGINE_PORT=3998 \
    TTS_PROXY_PORT=3999

EXPOSE 3000

CMD ["/app/start-stream.sh"]

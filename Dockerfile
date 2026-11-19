FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Chromium, FFmpeg, Xvfb, Openbox, PulseAudio, Vietnamese fonts & Emoji, optional TTS
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
    speech-dispatcher \
    espeak-ng \
    speech-dispatcher-espeak-ng \
    fontconfig \
    fonts-roboto \
    fonts-noto-color-emoji \
    fonts-dejavu-core \
    fonts-liberation \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user so PulseAudio and Chromium run cleanly
RUN useradd -m -s /bin/bash streamer

WORKDIR /app

# Install original Node.js dependencies without modifying package files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy original repository files untouched + streaming wrapper files
COPY . .

# Ensure Unix LF line endings, executable entrypoint, and ownership for server.js writes (.env, tracks/, gifts.json)
RUN sed -i 's/\r$//' /app/start-stream.sh \
    && chmod +x /app/start-stream.sh \
    && chown -R streamer:streamer /app

# Configure speech-dispatcher to output via PulseAudio + espeak-ng (optional Vietnamese TTS)
RUN mkdir -p /home/streamer/.config/speech-dispatcher \
    && cp /etc/speech-dispatcher/speechd.conf /home/streamer/.config/speech-dispatcher/speechd.conf \
    && sed -i 's/^#\s*AudioOutputMethod.*/AudioOutputMethod "pulse"/' /home/streamer/.config/speech-dispatcher/speechd.conf \
    && sed -i 's/^#\s*DefaultModule.*/DefaultModule espeak-ng/' /home/streamer/.config/speech-dispatcher/speechd.conf \
    && chown -R streamer:streamer /home/streamer

USER streamer

ENV DISPLAY=:99 \
    STREAM_WIDTH=720 \
    STREAM_HEIGHT=1280 \
    STREAM_FPS=30 \
    VIDEO_BITRATE=2500k \
    VIDEO_BUFSIZE=5000k \
    AUDIO_BITRATE=128k \
    X264_PRESET=veryfast \
    STREAM_URL_QUERY=mock=0

EXPOSE 3000

CMD ["/app/start-stream.sh"]

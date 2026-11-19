#!/usr/bin/env bash
set -u

APP_PORT="${PORT:-3000}"
STREAM_WIDTH="${STREAM_WIDTH:-720}"
STREAM_HEIGHT="${STREAM_HEIGHT:-1280}"
STREAM_FPS="${STREAM_FPS:-30}"
VIDEO_BITRATE="${VIDEO_BITRATE:-2500k}"
VIDEO_BUFSIZE="${VIDEO_BUFSIZE:-5000k}"
AUDIO_BITRATE="${AUDIO_BITRATE:-128k}"
X264_PRESET="${X264_PRESET:-veryfast}"
STREAM_URL_QUERY="${STREAM_URL_QUERY:-mock=0}"
DISPLAY="${DISPLAY:-:99}"
export DISPLAY

# Resolve RTMP server URL & stream key (accept common variable aliases, trim whitespace)
trim() {
  local v="$1"
  v="${v#"${v%%[![:space:]]*}"}"
  v="${v%"${v##*[![:space:]]}"}"
  printf '%s' "$v"
}

RAW_URL="$(trim "${RTMP_URL:-${TIKTOK_RTMP_URL:-${STREAM_URL:-}}}")"
RAW_KEY="$(trim "${RTMP_STREAM_KEY:-${TIKTOK_STREAM_KEY:-${STREAM_KEY:-}}}")"

TARGET_RTMP=""
if [ -n "$RAW_URL" ] && [ -n "$RAW_KEY" ]; then
  TARGET_RTMP="${RAW_URL%/}/${RAW_KEY#/}"
elif [ -n "$RAW_URL" ]; then
  TARGET_RTMP="$RAW_URL"
fi

# Safe masked URL for logging (never prints stream key or query secrets)
mask_rtmp() {
  local u="$1"
  local no_q="${u%%\?*}"
  local prefix="${no_q%/*}"
  if [ -n "$prefix" ] && [ "$prefix" != "$no_q" ]; then
    printf '%s/***' "$prefix"
  else
    printf 'rtmp://***'
  fi
}

STOPPING=0
PIDS=()

cleanup() {
  STOPPING=1
  echo "[stream] Đang dừng toàn bộ tiến trình..."
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  pkill -P $$ 2>/dev/null || true
  pulseaudio --kill 2>/dev/null || true
  exit 0
}
trap cleanup SIGTERM SIGINT

# 1. Start original Node.js server untouched in an auto-restart loop
run_node() {
  while [ "$STOPPING" -eq 0 ]; do
    echo "[app] Khởi động server gốc: node server.js (PORT=${APP_PORT})"
    node /app/server.js
    code=$?
    if [ "$STOPPING" -ne 0 ]; then break; fi
    echo "[app] server.js dừng với mã ${code}, khởi động lại sau 2s..."
    sleep 2
  done
}
run_node &
NODE_SUP_PID=$!
PIDS+=("$NODE_SUP_PID")

# Wait until original server responds
echo "[stream] Chờ server web sẵn sàng tại http://127.0.0.1:${APP_PORT}..."
READY=0
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${APP_PORT}/config.js" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "[stream] CẢNH BÁO: Không kết nối được tới http://127.0.0.1:${APP_PORT}/config.js sau 30s."
fi

# If RTMP is not configured yet, stay alive in web-only mode instead of crash-looping
if [ -z "$TARGET_RTMP" ]; then
  echo "[stream] Chưa cấu hình RTMP_URL / RTMP_STREAM_KEY."
  echo "[stream] Server web vẫn đang chạy bình thường trên cổng ${APP_PORT}."
  echo "[stream] Hãy thêm RTMP_URL và RTMP_STREAM_KEY trong mục Variables của Railway để tự phát live 24/7."
  wait "$NODE_SUP_PID"
  exit 0
fi

echo "[stream] Chuẩn bị phát live 24/7 (${STREAM_WIDTH}x${STREAM_HEIGHT} @ ${STREAM_FPS}fps, video=${VIDEO_BITRATE}, audio=${AUDIO_BITRATE})"
echo "[stream] Đích RTMP: $(mask_rtmp "$TARGET_RTMP")"

# 2. Start virtual X11 display (Xvfb) + lightweight window manager (Openbox)
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true
Xvfb "$DISPLAY" -screen 0 "${STREAM_WIDTH}x${STREAM_HEIGHT}x24" -ac +extension GLX +render -noreset &
XVFB_PID=$!
PIDS+=("$XVFB_PID")

for _ in $(seq 1 20); do
  if xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

openbox >/dev/null 2>&1 &
OPENBOX_PID=$!
PIDS+=("$OPENBOX_PID")
sleep 1

# 3. Start D-Bus session + PulseAudio pure virtual speaker sink (captures game SFX, music, and TTS)
export XDG_RUNTIME_DIR="/tmp/runtime-streamer"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

if command -v dbus-launch >/dev/null 2>&1; then
  eval "$(dbus-launch --sh-syntax)" 2>/dev/null || true
fi

pulseaudio --kill 2>/dev/null || true
pulseaudio \
  --daemonize=yes \
  --exit-idle-time=-1 \
  --disallow-exit \
  --disable-shm=yes \
  -n \
  --load="module-native-protocol-unix" \
  --load="module-null-sink sink_name=virtual_speaker sink_properties=device.description=VirtualSpeaker" \
  --load="module-always-sink"

for _ in $(seq 1 15); do
  if pactl info >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

pactl set-default-sink virtual_speaker >/dev/null 2>&1 || true

# Optional: start speech-dispatcher for Web Speech API TTS if enabled
if [ "$(printf '%s' "${TTS_ENABLED:-true}" | tr '[:upper:]' '[:lower:]')" != "false" ]; then
  speech-dispatcher -d >/dev/null 2>&1 || true
fi

# 4. Launch Chromium in kiosk mode pointing to original game page (with auto-restart)
GAME_URL="http://127.0.0.1:${APP_PORT}/?${STREAM_URL_QUERY}"
echo "[stream] Mở trình duyệt hiển thị game: ${GAME_URL}"

run_chromium() {
  while [ "$STOPPING" -eq 0 ]; do
    rm -rf /tmp/chrome-profile/Singleton* 2>/dev/null || true
    mkdir -p /tmp/chrome-profile

    chromium \
      --no-sandbox \
      --disable-setuid-sandbox \
      --disable-dev-shm-usage \
      --disable-gpu \
      --disable-gpu-compositing \
      --autoplay-policy=no-user-gesture-required \
      --disable-background-timer-throttling \
      --disable-backgrounding-occluded-windows \
      --disable-renderer-backgrounding \
      --disable-infobars \
      --no-first-run \
      --no-default-browser-check \
      --disable-notifications \
      --disable-translate \
      --disable-sync \
      --disable-extensions \
      --disable-features=TranslateUI,MediaRouter,DialMediaRouteProvider \
      --enable-speech-dispatcher \
      --user-data-dir=/tmp/chrome-profile \
      --window-position=0,0 \
      --window-size="${STREAM_WIDTH},${STREAM_HEIGHT}" \
      --force-device-scale-factor=1 \
      --kiosk \
      "${GAME_URL}" >/tmp/chromium.log 2>&1 &
    CHROME_PID=$!

    # Trigger one harmless click after page load so Web Audio unlock() always fires
    (
      sleep 5
      xdotool mousemove 20 20 click 1 >/dev/null 2>&1 || true
      xdotool mousemove 0 0 >/dev/null 2>&1 || true
    ) &

    wait "$CHROME_PID"
    code=$?
    if [ "$STOPPING" -ne 0 ]; then break; fi
    echo "[stream] Chromium dừng với mã ${code}, mở lại sau 2s..."
    tail -n 15 /tmp/chromium.log 2>/dev/null || true
    sleep 2
  done
}
run_chromium &
CHROME_SUP_PID=$!
PIDS+=("$CHROME_SUP_PID")

# Give Chromium time to render initial pond and unlock audio
sleep 6

# 5. Start FFmpeg 24/7 RTMP streamer with automatic reconnect
GOP_SIZE=$((STREAM_FPS * 2))

while [ "$STOPPING" -eq 0 ]; do
  echo "[stream] Bắt đầu đẩy luồng FFmpeg lên RTMP..."
  ffmpeg -hide_banner -loglevel warning \
    -thread_queue_size 1024 \
    -f x11grab -draw_mouse 0 -framerate "${STREAM_FPS}" -video_size "${STREAM_WIDTH}x${STREAM_HEIGHT}" -i "${DISPLAY}.0" \
    -thread_queue_size 1024 \
    -f pulse -ac 2 -ar 44100 -i "virtual_speaker.monitor" \
    -af "aresample=async=1:first_pts=0" \
    -c:v libx264 -preset "${X264_PRESET}" -tune zerolatency \
    -pix_fmt yuv420p -profile:v main -level 4.1 \
    -r "${STREAM_FPS}" -g "${GOP_SIZE}" -keyint_min "${GOP_SIZE}" -sc_threshold 0 \
    -b:v "${VIDEO_BITRATE}" -maxrate "${VIDEO_BITRATE}" -bufsize "${VIDEO_BUFSIZE}" \
    -c:a aac -b:a "${AUDIO_BITRATE}" -ar 44100 -ac 2 \
    -f flv -flvflags no_duration_filesize \
    "${TARGET_RTMP}"

  code=$?
  if [ "$STOPPING" -ne 0 ]; then break; fi
  echo "[stream] Luồng RTMP bị ngắt (mã ${code}), tự động kết nối lại sau 3s..."
  sleep 3
done

# Fishing Live 24/7 (Railway / Docker RTMP)

Dự án giữ nguyên **100% mã nguồn và chức năng gốc** của [khiem-tv/fishing-live](https://github.com/khiem-tv/fishing-live) (`server.js`, `public/*`, `gifts.json`, `package.json`), chỉ bổ sung lớp đóng gói Docker (`Dockerfile`, `start-stream.sh`, `railway.json`) để chạy trình duyệt ảo + FFmpeg phát trực tiếp 24/7 lên **TikTok Live RTMP** trên **Railway** (hoặc bất kỳ VPS Linux nào).

## Các biến môi trường (Variables) trên Railway

### Bắt buộc để phát Live 24/7 + nhận tương tác TikTok

| Biến | Mô tả | Ví dụ |
|---|---|---|
| `TIKTOK_USERNAME` | ID kênh TikTok của bạn (không cần dấu `@`) | `tenkenhcuaban` |
| `RTMP_URL` | Server URL RTMP của TikTok | `rtmp://push-rtmp-l11-sg.tiktokcdn.com/game` |
| `RTMP_STREAM_KEY` | Stream Key của TikTok | `stream-xxxxxxxxxxxx?...` |

> Nếu bạn dán trọn bộ link gồm cả URL + Stream Key vào `RTMP_URL` thì để trống `RTMP_STREAM_KEY` vẫn chạy được.

### Khuyên dùng

| Biến | Mô tả | Mặc định |
|---|---|---|
| `EULER_API_KEY` | API key miễn phí tại https://www.eulerstream.com để kết nối phòng live TikTok ổn định, tránh bị giới hạn | *(trống)* |

### Tuỳ chọn (chất lượng video & âm thanh)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `STREAM_WIDTH` | Chiều rộng khung hình dọc 9:16 (`720` hoặc `1080`) | `720` |
| `STREAM_HEIGHT` | Chiều cao khung hình dọc 9:16 (`1280` hoặc `1920`) | `1280` |
| `STREAM_FPS` | Số khung hình/giây (`25` hoặc `30`) | `30` |
| `VIDEO_BITRATE` | Bitrate video (nên `2500k` cho 720p, `4000k`–`4500k` cho 1080p) | `2500k` |
| `VIDEO_BUFSIZE` | Buffer VBV (thường gấp đôi `VIDEO_BITRATE`) | `5000k` |
| `AUDIO_BITRATE` | Bitrate âm thanh AAC | `128k` |
| `X264_PRESET` | Tốc độ nén CPU (`ultrafast`, `superfast`, `veryfast`) | `veryfast` |
| `TTS_ENABLED` | Bật/tắt giọng đọc TTS (`true` hoặc `false`) | `true` |
| `TTS_LANG` | Ngôn ngữ TTS | `vi-VN` |
| `SFX_VOLUME` | Âm lượng hiệu ứng (`0.0` – `1.0`) | `0.5` |
| `MUSIC_VOLUME` | Âm lượng nhạc nền (`0.0` – `1.0`) | `0.35` |

## Cách deploy lên Railway

1. Đăng nhập https://railway.com → **New Project** → **Deploy from GitHub repo** → chọn repo này.
2. Vào tab **Variables**, điền `TIKTOK_USERNAME`, `RTMP_URL`, `RTMP_STREAM_KEY` (và `EULER_API_KEY` nếu có).
3. Railway sẽ tự build bằng `Dockerfile`, khởi chạy `server.js` nguyên bản, mở game toàn màn hình và đẩy luồng video/âm thanh thẳng lên TikTok 24/7 (tự kết nối lại nếu rớt mạng).
4. Kiểm tra tab **Logs**:
   - Thấy `[stream] Bắt đầu đẩy luồng FFmpeg lên RTMP...` là đã phát video lên TikTok.
   - Thấy `[tiktok] live <TIKTOK_USERNAME>` là đã kết nối nhận chat/like/follow/quà.

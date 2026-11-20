#!/usr/bin/env python3
"""Lightweight local Microsoft Edge Neural TTS server for natural Vietnamese AI voice."""

import asyncio
import os
import re
from aiohttp import web
import edge_tts

HOST = "127.0.0.1"
PORT = int(os.environ.get("TTS_ENGINE_PORT", "3998"))
DEFAULT_VOICE = os.environ.get("TTS_VOICE", "vi-VN-HoaiMyNeural").strip() or "vi-VN-HoaiMyNeural"
_RAW_RATE = os.environ.get("TTS_RATE", "+5%").strip()
DEFAULT_RATE = _RAW_RATE if re.match(r"^[+-]\d+%$", _RAW_RATE) else "+5%"


async def synthesize(text: str, voice: str, rate: str) -> bytes:
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate)
    chunks = bytearray()
    async for msg in comm.stream():
        if msg.get("type") == "audio":
            data = msg.get("data")
            if data:
                chunks.extend(data)
    return bytes(chunks)


async def handle_health(_request: web.Request) -> web.Response:
    return web.Response(text="ok")


async def handle_speak(request: web.Request) -> web.Response:
    text = (request.query.get("text") or "").strip()[:200]
    if not text:
        return web.Response(status=400, text="empty text")

    voice = (request.query.get("voice") or DEFAULT_VOICE).strip() or DEFAULT_VOICE
    rate = (request.query.get("rate") or DEFAULT_RATE).strip() or DEFAULT_RATE

    try:
        audio = await asyncio.wait_for(synthesize(text, voice, rate), timeout=6.0)
    except Exception as exc:
        print(f"[tts-engine] edge-tts error: {exc}", flush=True)
        return web.Response(status=502, text="edge-tts error")

    if len(audio) < 256:
        return web.Response(status=502, text="empty audio")

    return web.Response(
        body=audio,
        status=200,
        headers={
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
        },
    )


def main() -> None:
    app = web.Application()
    app.router.add_get("/health", handle_health)
    app.router.add_get("/speak", handle_speak)
    print(f"[tts-engine] Edge Neural TTS ready on http://{HOST}:{PORT} (voice={DEFAULT_VOICE}, rate={DEFAULT_RATE})", flush=True)
    web.run_app(app, host=HOST, port=PORT, print=None)


if __name__ == "__main__":
    main()

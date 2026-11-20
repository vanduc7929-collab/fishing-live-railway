#!/usr/bin/env node
'use strict';

/**
 * Local reverse-proxy wrapper that keeps all original fishing-live files 100% untouched
 * while replacing Linux Chromium's broken espeak-ng Web Speech API with natural Vietnamese
 * AI voice (Microsoft Edge Neural TTS with automatic Google TTS fallback + LRU cache).
 */

const http = require('http');
const net = require('net');

const APP_PORT = parseInt(process.env.PORT || '3000', 10) || 3000;
const PROXY_PORT = parseInt(process.env.TTS_PROXY_PORT || '3999', 10) || 3999;
const EDGE_PORT = parseInt(process.env.TTS_ENGINE_PORT || '3998', 10) || 3998;
const TTS_ENGINE = String(process.env.TTS_ENGINE || 'edge').trim().toLowerCase();
const TTS_VOICE = String(process.env.TTS_VOICE || 'vi-VN-HoaiMyNeural').trim();
const TTS_RATE = String(process.env.TTS_RATE || '+5%').trim();
const DEFAULT_LANG = String(process.env.TTS_LANG || 'vi-VN').trim() || 'vi-VN';

const CACHE_MAX = 200;
const ttsCache = new Map();
let loggedEngine = '';

function cacheGet(k) {
  if (!ttsCache.has(k)) return null;
  const v = ttsCache.get(k);
  ttsCache.delete(k);
  ttsCache.set(k, v);
  return v;
}

function cacheSet(k, v) {
  ttsCache.set(k, v);
  if (ttsCache.size > CACHE_MAX) {
    ttsCache.delete(ttsCache.keys().next().value);
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(url, Object.assign({}, options, { signal: ac.signal }));
  } finally {
    clearTimeout(timer);
  }
}

async function fetchEdgeTts(text) {
  const qs = new URLSearchParams({ text, voice: TTS_VOICE, rate: TTS_RATE });
  const res = await fetchWithTimeout(`http://127.0.0.1:${EDGE_PORT}/speak?${qs.toString()}`, {}, 6000);
  if (!res.ok) throw new Error(`edge HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 256) throw new Error('edge empty audio');
  return buf;
}

async function fetchGoogleTts(text, lang) {
  const tl = String(lang || DEFAULT_LANG).split('-')[0].toLowerCase() || 'vi';
  const qs = new URLSearchParams({
    ie: 'UTF-8',
    tl,
    client: 'tw-ob',
    q: text,
  });
  const res = await fetchWithTimeout(
    `https://translate.google.com/translate_tts?${qs.toString()}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
    5000
  );
  if (!res.ok) throw new Error(`google HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 256) throw new Error('google empty audio');
  return buf;
}

async function synthesizeTts(text, lang) {
  const key = `${TTS_ENGINE}|${TTS_VOICE}|${TTS_RATE}|${lang}|${text}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  let buf = null;
  if (TTS_ENGINE !== 'google') {
    try {
      buf = await fetchEdgeTts(text);
      if (loggedEngine !== 'edge') {
        loggedEngine = 'edge';
        console.log(`[tts-proxy] Đang phát giọng AI Microsoft Edge Neural (${TTS_VOICE})`);
      }
    } catch (e) {
      console.log(`[tts-proxy] Edge TTS lỗi (${e.message}), tự động chuyển sang Google TTS...`);
    }
  }

  if (!buf) {
    buf = await fetchGoogleTts(text, lang);
    if (loggedEngine !== 'google') {
      loggedEngine = 'google';
      console.log(`[tts-proxy] Đang phát giọng AI Google TTS (${lang})`);
    }
  }

  cacheSet(key, buf);
  return buf;
}

const SHIM_JS = `(function(){
  var curAudio = null;
  var curDone = null;
  var seq = 0;

  function stopCurrent(fireEnd) {
    seq++;
    var a = curAudio;
    var fn = curDone;
    curAudio = null;
    curDone = null;
    if (a) {
      a.onended = null;
      a.onerror = null;
      try { a.pause(); a.removeAttribute('src'); a.load(); } catch (_) {}
    }
    if (fireEnd && fn) {
      try { fn(); } catch (_) {}
    }
  }

  function speakShim(u) {
    stopCurrent(false);
    var text = String((u && u.text) || '').trim();
    if (!text) {
      setTimeout(function () { if (u && typeof u.onend === 'function') u.onend({ type: 'end' }); }, 10);
      return;
    }

    var mySeq = ++seq;
    var lang = String((u && u.lang) || (window.GC && window.GC.lang) || 'vi-VN');
    var vol = (u && typeof u.volume === 'number') ? Math.max(0, Math.min(1, u.volume)) : 1;
    var finished = false;

    function finish(isErr) {
      if (finished) return;
      finished = true;
      if (mySeq === seq) {
        curAudio = null;
        curDone = null;
      }
      var cb = isErr ? (u && u.onerror) : (u && u.onend);
      if (typeof cb === 'function') {
        try { cb({ type: isErr ? 'error' : 'end' }); } catch (_) {}
      }
    }

    var a = new Audio('/__tts?text=' + encodeURIComponent(text) + '&lang=' + encodeURIComponent(lang));
    a.volume = vol;
    a.onended = function () { finish(false); };
    a.onerror = function () { finish(true); };
    curAudio = a;
    curDone = function () { finish(false); };

    try {
      var p = a.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { finish(true); });
      }
    } catch (_) {
      finish(true);
    }
  }

  function cancelShim() {
    stopCurrent(false);
  }

  function getVoicesShim() {
    return [{ name: 'Vietnamese AI Neural', lang: 'vi-VN', default: true, localService: true, voiceURI: 'vi-VN-neural' }];
  }

  try {
    if (window.SpeechSynthesis && window.SpeechSynthesis.prototype) {
      window.SpeechSynthesis.prototype.speak = speakShim;
      window.SpeechSynthesis.prototype.cancel = cancelShim;
      window.SpeechSynthesis.prototype.getVoices = getVoicesShim;
    }
  } catch (_) {}

  try {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: speakShim,
        cancel: cancelShim,
        pause: function () {},
        resume: function () {},
        getVoices: getVoicesShim,
        onvoiceschanged: null,
        speaking: false,
        pending: false,
        paused: false
      }
    });
  } catch (_) {}

  if (typeof window.SpeechSynthesisUtterance !== 'function') {
    window.SpeechSynthesisUtterance = function (text) {
      this.text = String(text || '');
      this.lang = 'vi-VN';
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
      this.onend = null;
      this.onerror = null;
    };
  }
})();
`;

function handleHtmlProxy(req, res) {
  const headers = Object.assign({}, req.headers, { 'accept-encoding': 'identity' });
  delete headers['if-none-match'];
  delete headers['if-modified-since'];
  const up = http.request(
    { hostname: '127.0.0.1', port: APP_PORT, path: req.url, method: req.method, headers },
    (upRes) => {
      const chunks = [];
      upRes.on('data', (c) => chunks.push(c));
      upRes.on('end', () => {
        let html = Buffer.concat(chunks).toString('utf8');
        if (/<script\s+src="\/audio\.js"\s*><\/script>/i.test(html)) {
          html = html.replace(
            /<script\s+src="\/audio\.js"\s*><\/script>/i,
            '<script src="/__tts-shim.js"></script><script src="/audio.js"></script>'
          );
        } else {
          html = html.replace('</head>', '<script src="/__tts-shim.js"></script></head>');
        }
        const body = Buffer.from(html, 'utf8');
        const outHeaders = Object.assign({}, upRes.headers);
        delete outHeaders['content-length'];
        delete outHeaders['content-encoding'];
        delete outHeaders['transfer-encoding'];
        delete outHeaders['etag'];
        outHeaders['content-length'] = String(body.length);
        outHeaders['cache-control'] = 'no-store';
        res.writeHead(upRes.statusCode || 200, outHeaders);
        res.end(body);
      });
    }
  );
  up.on('error', (e) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Upstream error: ' + e.message);
  });
  req.pipe(up);
}

function handleDirectProxy(req, res) {
  const up = http.request(
    { hostname: '127.0.0.1', port: APP_PORT, path: req.url, method: req.method, headers: req.headers },
    (upRes) => {
      res.writeHead(upRes.statusCode || 200, upRes.headers);
      upRes.pipe(res);
    }
  );
  up.on('error', (e) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Upstream error: ' + e.message);
  });
  req.pipe(up);
}

const server = http.createServer(async (req, res) => {
  let u;
  try {
    u = new URL(req.url, `http://127.0.0.1:${PROXY_PORT}`);
  } catch (_) {
    res.writeHead(400);
    return res.end('Bad URL');
  }

  if (u.pathname === '/__tts-shim.js') {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    return res.end(SHIM_JS);
  }

  if (u.pathname === '/__tts') {
    const text = (u.searchParams.get('text') || '').trim().slice(0, 200);
    const lang = (u.searchParams.get('lang') || DEFAULT_LANG).trim() || DEFAULT_LANG;
    if (!text) {
      res.writeHead(400);
      return res.end('Missing text');
    }
    try {
      const mp3 = await synthesizeTts(text, lang);
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(mp3.length),
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      });
      return res.end(mp3);
    } catch (e) {
      console.log(`[tts-proxy] TTS thất bại: ${e.message}`);
      res.writeHead(502);
      return res.end('TTS unavailable');
    }
  }

  if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) {
    return handleHtmlProxy(req, res);
  }

  return handleDirectProxy(req, res);
});

// Forward WebSocket upgrades (Socket.IO) transparently to original server.js
server.on('upgrade', (req, socket, head) => {
  const upstream = net.connect(APP_PORT, '127.0.0.1', () => {
    let raw = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      raw += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
    }
    raw += '\r\n';
    upstream.write(raw);
    if (head && head.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });

  const closeBoth = () => {
    try { upstream.destroy(); } catch (_) {}
    try { socket.destroy(); } catch (_) {}
  };
  upstream.on('error', closeBoth);
  socket.on('error', closeBoth);
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`[tts-proxy] Listening on http://127.0.0.1:${PROXY_PORT} -> app :${APP_PORT} (engine=${TTS_ENGINE}, voice=${TTS_VOICE})`);
});

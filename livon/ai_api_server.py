#!/usr/bin/env python3
"""LIVON AI chat proxy. Keep API keys on the server — never in frontend code.

Usage:
  export OPENAI_API_KEY=sk-...
  # optional: OPENAI_MODEL=gpt-4o-mini  LIVON_AI_PORT=8767
  python3 livon/ai_api_server.py

Endpoints:
  GET  /api/livon-ai/health
  POST /api/livon-ai/chat  JSON { messages: [{role, content}], settings?: {} }
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("LIVON_AI_PORT", "8767"))
MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
MAX_INPUT = 8000
MAX_MESSAGES = 24
SYSTEM = """You are LIVON AI, a careful Korean life-planning assistant for the LIVON app.
Rules:
- Answer in Korean unless the user writes in another language.
- Do not invent real places, businesses, experts, prices, events, reviews, or reservation availability.
- For medical, legal, tax, or financial advice: give general information only and suggest consulting a professional or official sources. Never diagnose or give definitive legal/financial judgments.
- Prefer structured, readable answers with short headings and bullet lists when helpful.
- When proposing a life plan or checklist, include a fenced JSON block at the end with this shape (omit unknown dates/budgets rather than inventing them):
```json
{"plan":{"title":"...","goal":"...","startDate":"","endDate":"","steps":["..."],"todos":[{"title":"...","priority":"high|medium|low"}],"costItems":["..."],"memo":"","links":[{"label":"...","href":"#life|#today|#explore|#community|#life-now"}]}}
```
- Only include the JSON when the user asked for a plan/checklist/todos. Do not auto-save anything; the user must approve in the UI.
- You may suggest navigating to LIVON menus with hash links: #life, #today, #explore, #community, #life-now.
"""


def cors(handler: BaseHTTPRequestHandler) -> None:
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")


def read_json(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length") or 0)
    if length <= 0 or length > 200_000:
        return {}
    raw = handler.rfile.read(length)
    try:
        data = json.loads(raw.decode("utf-8"))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def call_openai(messages: list[dict], settings: dict) -> dict:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        return {
            "ok": False,
            "error": "not_configured",
            "message": "OPENAI_API_KEY가 설정되지 않았습니다. 서버 환경변수에 키를 넣은 뒤 ai_api_server.py를 실행해 주세요.",
        }

    length = (settings or {}).get("answerLength") or "balanced"
    length_note = {
        "short": "Keep answers concise.",
        "detailed": "Provide more detailed, step-by-step guidance.",
        "balanced": "Keep answers clear and moderately detailed.",
    }.get(length, "Keep answers clear and moderately detailed.")

    personalize = []
    if settings.get("personalize"):
        if settings.get("stage"):
            personalize.append(f"User life stage preference: {settings['stage']}s (do not assume beyond this).")
        if settings.get("interests"):
            personalize.append(f"Interests: {settings['interests']}")
        if settings.get("region"):
            personalize.append(f"Preferred region: {settings['region']}")
        if settings.get("goal"):
            personalize.append(f"Life goal: {settings['goal']}")

    sys = SYSTEM + "\n" + length_note
    if personalize:
        sys += "\nPersonalization (user-provided only):\n- " + "\n- ".join(personalize)

    payload = {
        "model": MODEL,
        "temperature": 0.4,
        "messages": [{"role": "system", "content": sys}] + messages,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")[:400]
        return {"ok": False, "error": "upstream", "message": f"AI 서비스 오류({e.code}). 잠시 후 다시 시도해 주세요.", "detail": detail}
    except Exception:
        return {"ok": False, "error": "network", "message": "네트워크 상태를 확인하고 다시 시도해 주세요."}

    try:
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return {"ok": False, "error": "bad_response", "message": "답변을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}

    return {"ok": True, "content": content, "model": MODEL}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        # Avoid logging message bodies / PII
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        cors(self)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.split("?")[0] == "/api/livon-ai/health":
            configured = bool(os.environ.get("OPENAI_API_KEY", "").strip())
            self._json(200, {"ok": True, "configured": configured, "model": MODEL if configured else None})
            return
        self._json(404, {"ok": False, "error": "not_found"})

    def do_POST(self) -> None:
        if self.path.split("?")[0] != "/api/livon-ai/chat":
            self._json(404, {"ok": False, "error": "not_found"})
            return
        data = read_json(self)
        messages = data.get("messages") or []
        if not isinstance(messages, list) or not messages:
            self._json(400, {"ok": False, "error": "bad_request", "message": "메시지가 비어 있습니다."})
            return
        cleaned = []
        for m in messages[-MAX_MESSAGES:]:
            if not isinstance(m, dict):
                continue
            role = m.get("role")
            content = str(m.get("content") or "").strip()
            if role not in ("user", "assistant") or not content:
                continue
            cleaned.append({"role": role, "content": content[:MAX_INPUT]})
        if not cleaned or cleaned[-1]["role"] != "user":
            self._json(400, {"ok": False, "error": "bad_request", "message": "유효한 사용자 메시지가 필요합니다."})
            return
        settings = data.get("settings") if isinstance(data.get("settings"), dict) else {}
        result = call_openai(cleaned, settings)
        self._json(200 if result.get("ok") else 503, result)

    def _json(self, code: int, payload: dict) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        cors(self)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    configured = bool(os.environ.get("OPENAI_API_KEY", "").strip())
    print(f"LIVON AI API on http://127.0.0.1:{PORT}  configured={configured}  model={MODEL}")
    server.serve_forever()


if __name__ == "__main__":
    main()

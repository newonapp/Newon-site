#!/usr/bin/env python3
import json, urllib.request, time, base64, os, struct, socket
from urllib.parse import urlparse

PORT = 9230
OUT = "/Users/kyungnawon/Newon/_preview-shots"

# assume chrome already running with --remote-debugging-port=9230
tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))
# create target
urllib.request.urlopen(
    urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?http://127.0.0.1:8765/ko/", method="PUT")
)
time.sleep(1.2)
tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))
page = [t for t in tabs if "8765" in t.get("url", "")][0]
wsurl = page["webSocketDebuggerUrl"]
print("page", page["url"])

u = urlparse(wsurl)
sock = socket.create_connection((u.hostname, u.port))
key = base64.b64encode(os.urandom(16)).decode()
sock.sendall(
    (
        f"GET {u.path} HTTP/1.1\r\nHost: {u.hostname}:{u.port}\r\n"
        f"Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
    ).encode()
)
assert b"101" in sock.recv(4096)

msg_id = 0


def send(obj):
    data = json.dumps(obj).encode()
    fin_opcode = 0x81
    mask_bit = 0x80
    ln = len(data)
    if ln < 126:
        hdr = bytes([fin_opcode, mask_bit | ln])
    elif ln < 65536:
        hdr = bytes([fin_opcode, mask_bit | 126]) + struct.pack("!H", ln)
    else:
        hdr = bytes([fin_opcode, mask_bit | 127]) + struct.pack("!Q", ln)
    mask = os.urandom(4)
    body = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
    sock.sendall(hdr + mask + body)


def recv():
    hdr = b""
    while len(hdr) < 2:
        hdr += sock.recv(2 - len(hdr))
    ln = hdr[1] & 0x7F
    if ln == 126:
        ext = sock.recv(2)
        ln = struct.unpack("!H", ext)[0]
    elif ln == 127:
        ext = sock.recv(8)
        ln = struct.unpack("!Q", ext)[0]
    data = b""
    while len(data) < ln:
        chunk = sock.recv(ln - len(data))
        if not chunk:
            break
        data += chunk
    return json.loads(data.decode())


def call(method, params=None):
    global msg_id
    msg_id += 1
    mid = msg_id
    send({"id": mid, "method": method, "params": params or {}})
    while True:
        m = recv()
        if m.get("id") == mid:
            return m


call("Page.enable")
call("Runtime.enable")
call("Page.navigate", {"url": "http://127.0.0.1:8765/ko/?v=prem2"})
time.sleep(2.5)

# reveal sections
call(
    "Runtime.evaluate",
    {
        "expression": "document.querySelectorAll('[data-hs-section],.hs-bridge').forEach(el=>el.classList.add('is-in','hs-reveal'))"
    },
)
time.sleep(0.3)


def shot(sel, name):
    call(
        "Runtime.evaluate",
        {"expression": f"document.querySelector('{sel}')?.scrollIntoView({{block:'center'}})"},
    )
    time.sleep(0.8)
    exists = call(
        "Runtime.evaluate",
        {
            "expression": f"!!document.querySelector('{sel}')",
            "returnByValue": True,
        },
    )
    print(sel, "exists", exists.get("result", {}).get("result", {}).get("value"))
    s = call("Page.captureScreenshot", {"format": "png", "fromSurface": True})
    data = base64.b64decode(s["result"]["data"])
    path = f"{OUT}/{name}"
    open(path, "wb").write(data)
    print("wrote", path, len(data))


shot("#hs-resources", "section-resources.png")
shot("#hs-numbers", "section-numbers.png")
shot("#hs-ideas", "section-ideas.png")
sock.close()
print("done")

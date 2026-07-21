#!/usr/bin/env python3
"""
Generate Newon promotional stills + video frames from the real brand logo.

  python3 scripts/export-promo-assets.py

Output: promo/
"""
from __future__ import annotations

import math
import os
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "promo"
FRAMES = OUT / "frames"
LOGO = ROOT / "logo.png"
ATMOS_SRC = Path.home() / ".cursor/projects/Users-kyungnawon-Newon/assets"

APPS = [
    "OX MONTH",
    "SubPing",
    "Pillmate",
    "SAVY",
    "BabyLog",
    "PetLog",
    "PiggyUp",
    "GoalUp",
    "CountUp",
    "Noting",
]

FONT_KO = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
FONT_EN = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_EN_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_UNI = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    try:
        if path.endswith(".ttc"):
            return ImageFont.truetype(path, size=size, index=index)
        return ImageFont.truetype(path, size=size)
    except OSError:
        return ImageFont.truetype(FONT_UNI, size=size)


def load_logo(max_side: int) -> Image.Image:
    img = Image.open(LOGO).convert("RGBA")
    # Trim near-black letterbox so the mark sits cleanly on black canvases.
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        img = img.crop(bbox)
    w, h = img.size
    scale = max_side / max(w, h)
    return img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)


def soft_glow(base: Image.Image, strength: float = 0.35) -> Image.Image:
    """Subtle radial vignette light behind the logo."""
    w, h = base.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cx, cy = w // 2, int(h * 0.42)
    max_r = int(min(w, h) * 0.55)
    for i in range(max_r, 0, -4):
        t = 1 - (i / max_r)
        a = int(38 * strength * (t ** 2))
        draw.ellipse((cx - i, cy - i, cx + i, cy + i), fill=(255, 255, 255, a))
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def center_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.ImageFont,
    fill=(255, 255, 255, 255),
) -> None:
    tw, th = text_size(draw, text, fnt)
    draw.text((xy[0] - tw // 2, xy[1] - th // 2), text, font=fnt, fill=fill)


def paste_center(canvas: Image.Image, mark: Image.Image, cy: int) -> None:
    x = (canvas.width - mark.width) // 2
    y = cy - mark.height // 2
    canvas.alpha_composite(mark, (x, y))


def make_canvas(w: int, h: int) -> Image.Image:
    return soft_glow(Image.new("RGBA", (w, h), (0, 0, 0, 255)), 0.42)


def save_rgb(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, "PNG", optimize=True)
    print(f"  wrote {path.relative_to(ROOT)}")


def promo_square() -> None:
    w = h = 1080
    canvas = make_canvas(w, h)
    mark = load_logo(420)
    paste_center(canvas, mark, 430)
    draw = ImageDraw.Draw(canvas)
    center_text(draw, (w // 2, 700), "NEWON", font(FONT_EN, 72), (255, 255, 255, 255))
    center_text(
        draw,
        (w // 2, 780),
        "아이디어를 현실로 만드는 앱 스튜디오",
        font(FONT_KO, 28, index=0),
        (210, 210, 210, 255),
    )
    center_text(draw, (w // 2, 980), "newon.app", font(FONT_EN_REG, 26), (160, 160, 160, 255))
    save_rgb(canvas, OUT / "newon-square-1080.png")


def promo_og() -> None:
    w, h = 1200, 630
    canvas = make_canvas(w, h)
    mark = load_logo(280)
    paste_center(canvas, mark, 250)
    draw = ImageDraw.Draw(canvas)
    center_text(draw, (w // 2, 430), "NEWON", font(FONT_EN, 64), (255, 255, 255, 255))
    center_text(
        draw,
        (w // 2, 510),
        "아이디어를 켜고, 일상의 변화를 설계합니다",
        font(FONT_KO, 26, index=0),
        (200, 200, 200, 255),
    )
    center_text(draw, (w // 2, 575), "newon.app", font(FONT_EN_REG, 22), (150, 150, 150, 255))
    save_rgb(canvas, OUT / "newon-og-1200x630.png")


def promo_story() -> None:
    w, h = 1080, 1920
    canvas = make_canvas(w, h)
    mark = load_logo(480)
    paste_center(canvas, mark, 720)
    draw = ImageDraw.Draw(canvas)
    center_text(draw, (w // 2, 220), "GLOBAL LIFE PLATFORM", font(FONT_EN, 24), (170, 170, 170, 255))
    center_text(draw, (w // 2, 1080), "NEWON", font(FONT_EN, 84), (255, 255, 255, 255))
    for i, line in enumerate(["아이디어를 켜고,", "일상의 변화를 설계합니다"]):
        center_text(
            draw,
            (w // 2, 1200 + i * 56),
            line,
            font(FONT_KO, 34, index=0),
            (220, 220, 220, 255),
        )
    center_text(draw, (w // 2, 1720), "newon.app", font(FONT_EN_REG, 30), (160, 160, 160, 255))
    save_rgb(canvas, OUT / "newon-story-1080x1920.png")


def promo_youtube() -> None:
    w, h = 1280, 720
    canvas = make_canvas(w, h)
    mark = load_logo(300)
    paste_center(canvas, mark, 280)
    draw = ImageDraw.Draw(canvas)
    center_text(draw, (w // 2, 480), "NEWON", font(FONT_EN, 70), (255, 255, 255, 255))
    center_text(
        draw,
        (w // 2, 560),
        "App studio · Productivity · Finance · Lifestyle",
        font(FONT_EN_REG, 26),
        (190, 190, 190, 255),
    )
    center_text(draw, (w // 2, 640), "newon.app", font(FONT_EN_REG, 24), (150, 150, 150, 255))
    save_rgb(canvas, OUT / "newon-youtube-1280x720.png")


def promo_apps_grid() -> None:
    w = h = 1080
    canvas = make_canvas(w, h)
    mark = load_logo(220)
    paste_center(canvas, mark, 220)
    draw = ImageDraw.Draw(canvas)
    center_text(draw, (w // 2, 380), "NEWON APPS", font(FONT_EN, 42), (255, 255, 255, 255))
    cols = 2
    start_y = 460
    gap_y = 48
    for i, name in enumerate(APPS):
        col = i % cols
        row = i // cols
        x = w // 2 - 220 + col * 440
        y = start_y + row * gap_y
        center_text(draw, (x, y), name, font(FONT_EN_REG, 28), (210, 210, 210, 255))
    center_text(draw, (w // 2, 980), "newon.app", font(FONT_EN_REG, 24), (150, 150, 150, 255))
    save_rgb(canvas, OUT / "newon-apps-1080.png")


def copy_atmosphere() -> None:
    mapping = {
        "newon-promo-atmosphere-square.png": "newon-atmosphere-square.png",
        "newon-promo-atmosphere-story.png": "newon-atmosphere-story.png",
        "newon-promo-atmosphere-wide.png": "newon-atmosphere-wide.png",
    }
    for src_name, dest_name in mapping.items():
        src = ATMOS_SRC / src_name
        if src.exists():
            dest = OUT / dest_name
            shutil.copy2(src, dest)
            print(f"  copied {dest.relative_to(ROOT)}")


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease_out(t: float) -> float:
    return 1 - (1 - t) ** 3


def ease_in_out(t: float) -> float:
    return 0.5 * (1 - math.cos(math.pi * t))


def with_opacity(img: Image.Image, opacity: float) -> Image.Image:
    out = img.copy()
    r, g, b, a = out.split()
    a = a.point(lambda p: int(p * max(0.0, min(1.0, opacity))))
    out.putalpha(a)
    return out


def frame_logo_reveal(t: float, w: int, h: int) -> Image.Image:
    canvas = make_canvas(w, h)
    scale = lerp(0.72, 1.0, ease_out(t))
    mark = with_opacity(load_logo(int(340 * scale)), ease_out(t))
    paste_center(canvas, mark, int(h * 0.42))
    return canvas


def frame_brand(t: float, w: int, h: int) -> Image.Image:
    canvas = make_canvas(w, h)
    mark = load_logo(300)
    paste_center(canvas, mark, int(h * 0.34))
    draw = ImageDraw.Draw(canvas)
    a = int(255 * ease_out(t))
    center_text(draw, (w // 2, int(h * 0.62)), "NEWON", font(FONT_EN, 64), (255, 255, 255, a))
    center_text(
        draw,
        (w // 2, int(h * 0.72)),
        "아이디어를 현실로 만드는 앱 스튜디오",
        font(FONT_KO, 28, index=0),
        (210, 210, 210, a),
    )
    return canvas


def frame_apps(t: float, w: int, h: int) -> Image.Image:
    canvas = make_canvas(w, h)
    draw = ImageDraw.Draw(canvas)
    center_text(draw, (w // 2, int(h * 0.18)), "NEWON", font(FONT_EN, 40), (255, 255, 255, 255))
    visible = int(lerp(0, len(APPS), ease_out(t)))
    for i, name in enumerate(APPS[: max(1, visible)]):
        fade = 1.0 if i < visible - 1 else (t * len(APPS) - i)
        fade = max(0.0, min(1.0, fade))
        y = int(h * 0.28) + i * 38
        center_text(
            draw,
            (w // 2, y),
            name,
            font(FONT_EN_REG, 28),
            (220, 220, 220, int(255 * fade)),
        )
    return canvas


def frame_cta(t: float, w: int, h: int) -> Image.Image:
    canvas = make_canvas(w, h)
    mark = load_logo(260)
    paste_center(canvas, mark, int(h * 0.36))
    draw = ImageDraw.Draw(canvas)
    a = int(255 * ease_out(t))
    center_text(draw, (w // 2, int(h * 0.62)), "NEWON", font(FONT_EN, 56), (255, 255, 255, a))
    center_text(draw, (w // 2, int(h * 0.74)), "newon.app", font(FONT_EN_REG, 36), (200, 200, 200, a))
    return canvas


def render_video_frames(fps: int = 30) -> list[Path]:
    FRAMES.mkdir(parents=True, exist_ok=True)
    for old in FRAMES.glob("*.png"):
        old.unlink()

    w, h = 1280, 720
    scenes = [
        (2.0, frame_logo_reveal),
        (3.0, frame_brand),
        (4.0, frame_apps),
        (3.0, frame_cta),
    ]
    paths: list[Path] = []
    idx = 0
    for duration, fn in scenes:
        n = int(duration * fps)
        for i in range(n):
            t = i / max(1, n - 1)
            # Crossfade hint: hold last 10% near full
            img = fn(ease_in_out(t), w, h)
            path = FRAMES / f"frame-{idx:04d}.png"
            img.convert("RGB").save(path, "PNG")
            paths.append(path)
            idx += 1
    print(f"  rendered {len(paths)} frames @ {fps}fps")
    return paths


def encode_video(fps: int = 30) -> Path | None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        print("  ffmpeg not found — skip video encode")
        return None
    out = OUT / "newon-promo-12s.mp4"
    cmd = [
        ffmpeg,
        "-y",
        "-framerate",
        str(fps),
        "-i",
        str(FRAMES / "frame-%04d.png"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-movflags",
        "+faststart",
        str(out),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"  wrote {out.relative_to(ROOT)}")
    return out


def write_readme() -> None:
    text = """# Newon 홍보 에셋

## 이미지
| 파일 | 용도 | 크기 |
|------|------|------|
| `newon-square-1080.png` | 인스타그램 / SNS 정사각 | 1080×1080 |
| `newon-og-1200x630.png` | OG / 링크 미리보기 | 1200×630 |
| `newon-story-1080x1920.png` | 스토리 / 릴스 / 숏츠 | 1080×1920 |
| `newon-youtube-1280x720.png` | 유튜브 썸네일 | 1280×720 |
| `newon-apps-1080.png` | 앱 라인업 소개 | 1080×1080 |
| `newon-atmosphere-*.png` | 분위기용 아트 스틸 | 다양한 비율 |

## 영상
| 파일 | 설명 |
|------|------|
| `newon-promo-12s.mp4` | 약 12초 브랜드 인트로 (무음, H.264) |

재생성:
```bash
python3 scripts/export-promo-assets.py
```
"""
    (OUT / "README.md").write_text(text, encoding="utf-8")
    print("  wrote promo/README.md")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Generating promo stills…")
    promo_square()
    promo_og()
    promo_story()
    promo_youtube()
    promo_apps_grid()
    copy_atmosphere()
    print("Generating video frames…")
    render_video_frames()
    print("Encoding video…")
    encode_video()
    if FRAMES.exists():
        shutil.rmtree(FRAMES)
        print("  cleaned promo/frames")
    write_readme()
    print("Done →", OUT)


if __name__ == "__main__":
    main()

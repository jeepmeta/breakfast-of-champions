#!/usr/bin/env python3
"""Decode base64 brand PNGs into assets/. Run from repo root: python3 scripts/decode-brand-assets.py"""
from pathlib import Path
import base64
root = Path(__file__).resolve().parents[1]
assets = root / "assets"
for name in ["icon.png", "splash.png", "adaptive-icon.png", "favicon.png"]:
    b64 = (root / "scripts" / f"{name}.b64").read_text().strip()
    (assets / name).write_bytes(base64.b64decode(b64))
    print("wrote", name, (assets / name).stat().st_size)

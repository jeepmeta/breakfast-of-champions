# Wafflr brand assets

Source: `branding-kit.html` (project artifacts) + `design-tokens.md`.

| File | Role |
|------|------|
| `icon.png` | App icon (1024²) — primary mark `mark-3x3-butter` |
| `adaptive-icon.png` | Android adaptive foreground on slate-900 |
| `splash.png` | Splash — primary mark + wordmark on `#0F172A` |
| `favicon.png` | Web favicon |
| `brand/mark-3x3-butter.svg` | Vector primary mark |

In-app: use `src/components/brand` (`WafflrMark`, `WafflrWordmark`, `WafflrLockup`).

After pull, generate PNGs if missing:

```bash
python3 scripts/decode-brand-assets.py
```

# Banner images

Put your 8 original banner images here (1254x1254, full colour), named exactly:

| File name (any of .png .jpg .jpeg .webp) | Project |
|---|---|
| `tamil-ai` | TAMIL-AI.ME |
| `aires` | AIRES |
| `secrain` | SECRAIN |
| `cullinan-ai` | CULLINAN AI |
| `titan` | TITAN |
| `eye-care-tool` | Eye-Care-Tool |
| `vch-agent` | VCH-AGENT |
| `news-bot` | news-bot |

Then, from the repo root, run:

    python scripts\make-banners.py

That creates the web-sized files in `public\banners\` (720 px and 360 px WebP) that the pages already use.
The files currently in `public\banners\` are grey placeholders; the script replaces them.
Your 1254 px originals stay in this folder and are not deployed (Vite only publishes `public\`).

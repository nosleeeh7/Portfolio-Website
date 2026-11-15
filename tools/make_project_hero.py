"""Compose assets/projects/alje-matcha.jpg: storefront (browser frame) + POS (tablet frame).
Run: python3 tools/make_project_hero.py <storefront.jpg> <pos.jpg>
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 900
BG = (18, 18, 22)
site = Image.open(sys.argv[1]).convert("RGB")
pos = Image.open(sys.argv[2]).convert("RGB")

canvas = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(canvas)
# subtle dot texture
for y in range(0, H, 16):
    for x in range(0, W, 16):
        d.point((x, y), fill=(30, 30, 36))

def rounded(img, r):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], radius=r, fill=255)
    return m

def shadow(size, r, blur=28, alpha=150):
    pad = blur * 2
    s = Image.new("RGBA", (size[0] + pad * 2, size[1] + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(s).rounded_rectangle([pad, pad, pad + size[0], pad + size[1]], radius=r, fill=(0, 0, 0, alpha))
    return s.filter(ImageFilter.GaussianBlur(blur)), pad

# --- Browser window (storefront), back-left ---
bw = 1040
site_s = site.resize((bw, int(site.height * bw / site.width)), Image.LANCZOS)
site_s = site_s.crop((0, 0, bw, min(site_s.height, 640)))
bar = 44
win = Image.new("RGB", (bw, site_s.height + bar), (36, 36, 42))
wd = ImageDraw.Draw(win)
for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
    wd.ellipse([16 + i * 22, 15, 30 + i * 22, 29], fill=c)
wd.rounded_rectangle([110, 11, bw - 110, 33], radius=6, fill=(24, 24, 28))
wd.text((bw // 2 - 95, 15), "alje-matcha-website.vercel.app", fill=(150, 150, 160))
win.paste(site_s, (0, bar))
wx, wy = 60, 70
sh, pad = shadow(win.size, 12)
canvas.paste(sh, (wx - pad, wy - pad + 18), sh)
canvas.paste(win, (wx, wy), rounded(win, 12))

# --- Tablet (POS), front-right ---
tw = 760
pos_s = pos.resize((tw, int(pos.height * tw / pos.width)), Image.LANCZOS)
bezel = 26
tab = Image.new("RGB", (tw + bezel * 2, pos_s.height + bezel * 2), (10, 10, 12))
tab.paste(pos_s, (bezel, bezel), rounded(pos_s, 10))
td = ImageDraw.Draw(tab)
td.ellipse([tab.width // 2 - 4, 9, tab.width // 2 + 4, 17], fill=(40, 40, 46))  # camera
tx, ty = W - tab.width - 60, H - tab.height - 60
sh, pad = shadow(tab.size, 30, blur=36, alpha=190)
canvas.paste(sh, (tx - pad, ty - pad + 24), sh)
canvas.paste(tab, (tx, ty), rounded(tab, 30))

canvas.save("assets/projects/alje-matcha.jpg", quality=88, optimize=True)
print("wrote assets/projects/alje-matcha.jpg", canvas.size)

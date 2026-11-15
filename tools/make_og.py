"""Generate assets/og.png (1200x630) in the site's visual language.
Run: python3 tools/make_og.py
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG, FG, FG2, FG3 = (12, 12, 15), (244, 244, 245), (161, 161, 170), (107, 107, 118)
BORDER, CHIP = (42, 42, 51), (26, 26, 32)
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# dotted texture, fading in from the top-right (like the site)
for y in range(0, H, 14):
    for x in range(0, W, 14):
        dx, dy = (W - x) / W, y / H
        a = max(0.0, 1 - (dx * 2.2 + dy * 1.6))
        if a > 0:
            v = int(12 + 60 * a)
            d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(v, v, v + 3))

# pixel headline: draw small in bold mono, upscale with NEAREST
def pixel_text(text, px_size=13, scale=6, color=FG):
    f = ImageFont.truetype(MONO_B, px_size)
    bbox = d.textbbox((0, 0), text, font=f)
    w, h = bbox[2] - bbox[0] + 2, bbox[3] - bbox[1] + 2
    tiny = Image.new("L", (w, h), 0)
    ImageDraw.Draw(tiny).text((-bbox[0] + 1, -bbox[1] + 1), text, font=f, fill=255)
    tiny = tiny.point(lambda p: 255 if p > 110 else 0)  # hard pixels
    big = tiny.resize((w * scale, h * scale), Image.NEAREST)
    layer = Image.new("RGB", big.size, color)
    return layer, big

X0 = 72
name_img, name_mask = pixel_text("Janos Lei Arana")
img.paste(name_img, (X0, 150), name_mask)

# subline with chips
f_sans = ImageFont.truetype(SANS, 26)
f_chip = ImageFont.truetype(SANS, 23)
y = 150 + name_mask.size[1] + 42
x = X0

def text(t, font, fill):
    global x
    d.text((x, y), t, font=font, fill=fill)
    x += d.textlength(t, font=font)

def chip(t):
    global x
    pad, h = 14, 40
    tw = d.textlength(t, font=f_chip)
    d.rounded_rectangle([x, y - 7, x + tw + pad * 2, y - 7 + h], radius=8, fill=CHIP, outline=BORDER)
    d.text((x + pad, y - 1), t, font=f_chip, fill=FG)
    x += tw + pad * 2 + 10

text("I'm a ", f_sans, FG2); chip("computer engineering"); text("student in Davao.", f_sans, FG2)
y += 58; x = X0
text("I build around ", f_sans, FG2); chip("embedded systems"); chip("networks"); text("& ", f_sans, FG2); chip("IoT")

# divider + footer
d.line([(X0, H - 112), (W - X0, H - 112)], fill=BORDER, width=1)
f_mono = ImageFont.truetype(MONO, 20)
f_mono_s = ImageFont.truetype(MONO, 15)
d.text((X0, H - 84), "janos-arana.vercel.app", font=f_mono, fill=FG)
d.text((X0, H - 52), "GITHUB  @NOSLEEEH7", font=f_mono_s, fill=FG3)
right = "HCDC · BS COMPUTER ENGINEERING · 4TH YEAR"
d.text((W - X0 - d.textlength(right, font=f_mono_s), H - 52), right, font=f_mono_s, fill=FG3)
d.text((W - X0 - d.textlength("Davao, PH", font=f_mono), H - 84), "Davao, PH", font=f_mono, fill=FG2)

img.save("assets/og.png", optimize=True)
print("wrote assets/og.png", img.size)

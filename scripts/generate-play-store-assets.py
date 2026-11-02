import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

base_dir = r"c:\cevdet\Mobil\Wool Crush\yumak-pop"
assets_dir = os.path.join(base_dir, "assets")
images_dir = os.path.join(assets_dir, "images")
sprites_dir = os.path.join(assets_dir, "sprites")

# 1024 x 500 Feature Graphic
WIDTH = 1024
HEIGHT = 500

# 1. Base knitted texture
home_bg_path = os.path.join(images_dir, "home.jpg")
if os.path.exists(home_bg_path):
    bg_img = Image.open(home_bg_path).convert("RGBA")
    # Resize and crop to 1024x500
    scale = max(WIDTH / bg_img.width, HEIGHT / bg_img.height)
    nw, nh = int(bg_img.width * scale), int(bg_img.height * scale)
    bg_img = bg_img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - WIDTH) // 2
    top = (nh - HEIGHT) // 2
    canvas = bg_img.crop((left, top, left + WIDTH, top + HEIGHT))
else:
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (255, 246, 234, 255))

# Apply warm, vibrant overlay
overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
draw_ov = ImageDraw.Draw(overlay)

# Ambient radial vignette
for r in range(400, 0, -20):
    alpha = int(40 * (1 - r / 400))
    draw_ov.ellipse([WIDTH/2 - r*1.5, HEIGHT/2 - r, WIDTH/2 + r*1.5, HEIGHT/2 + r], fill=(255, 250, 240, alpha))

canvas = Image.alpha_composite(canvas, overlay)

# 2. Add Mascot on Left (x: 50, y: 35)
mascot_path = os.path.join(images_dir, "mascot.png")
if os.path.exists(mascot_path):
    mascot = Image.open(mascot_path).convert("RGBA")
    # Scale mascot to height 430
    m_h = 430
    m_w = int(mascot.width * (m_h / mascot.height))
    mascot = mascot.resize((m_w, m_h), Image.Resampling.LANCZOS)

    # Soft drop shadow for mascot
    shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.ellipse([80, HEIGHT - 75, 80 + m_w - 40, HEIGHT - 25], fill=(70, 35, 15, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas = Image.alpha_composite(canvas, shadow)

    # Ambient warm glow behind mascot
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([40, 30, 40 + m_w + 30, 30 + m_h], fill=(255, 235, 190, 95))
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    canvas = Image.alpha_composite(canvas, glow)

    # Paste mascot
    canvas.paste(mascot, (65, 35), mascot)

# 3. Flanking Props: Spool and basket around
spool_path = os.path.join(sprites_dir, "spool_B.png")
if os.path.exists(spool_path):
    spool = Image.open(spool_path).convert("RGBA")
    spool = spool.resize((110, 110), Image.Resampling.LANCZOS).rotate(18, expand=True)
    canvas.paste(spool, (380, 320), spool)

basket_path = os.path.join(sprites_dir, "wicker_basket.png")
if os.path.exists(basket_path):
    basket = Image.open(basket_path).convert("RGBA")
    basket = basket.resize((125, 125), Image.Resampling.LANCZOS).rotate(-12, expand=True)
    canvas.paste(basket, (25, 320), basket)

# 4. Typography & Branding on Right Side (x: 480 to 980)
draw = ImageDraw.Draw(canvas)

# Fonts
font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 74)
font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 26)
font_pill = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 20)
font_brand = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 16)

# Title: Yumak Pop (Each letter colored with 3D drop shadow)
letters = [
    ('Y', (255, 107, 107)),
    ('u', (255, 165, 2)),
    ('m', (46, 213, 115)),
    ('a', (30, 144, 255)),
    ('k', (155, 89, 182)),
    (' ', (0, 0, 0)),
    ('P', (255, 71, 87)),
    ('o', (46, 213, 115)),
    ('p', (255, 159, 243)),
]

title_start_x = 510
title_start_y = 65

cur_x = title_start_x
for ch, color in letters:
    if ch == ' ':
        cur_x += 24
        continue
    
    # 3D Depth Shadow
    for depth in range(6, 0, -1):
        draw.text((cur_x + depth, title_start_y + depth), ch, font=font_title, fill=(90, 45, 20, 160))
    
    # Thick white outline for pop effect
    for ox in [-3, -2, -1, 0, 1, 2, 3]:
        for oy in [-3, -2, -1, 0, 1, 2, 3]:
            draw.text((cur_x + ox, title_start_y + oy), ch, font=font_title, fill=(255, 255, 255, 255))
    
    # Front character fill
    draw.text((cur_x, title_start_y), ch, font=font_title, fill=color)
    
    bbox = font_title.getbbox(ch)
    cur_x += (bbox[2] - bbox[0]) + 8

# Subtitle Card
sub_text = "İpleri Çöz • Makaraları Doldur!"
sub_x = 510
sub_y = 175

# Draw pill background for subtitle
sub_bbox = font_sub.getbbox(sub_text)
sub_w = sub_bbox[2] - sub_bbox[0] + 36
sub_h = sub_bbox[3] - sub_bbox[1] + 20

# Shadow for pill
draw.rounded_rectangle([sub_x + 2, sub_y + 4, sub_x + sub_w + 2, sub_y + sub_h + 4], radius=16, fill=(100, 50, 20, 70))
draw.rounded_rectangle([sub_x, sub_y, sub_x + sub_w, sub_y + sub_h], radius=16, fill=(255, 255, 255, 235), outline=(255, 180, 160, 255), width=2)
draw.text((sub_x + 18, sub_y + 8), sub_text, font=font_sub, fill=(92, 45, 145))

# 3 Feature Pills
pills = [
    ("🧶  Canlı Örgü & İp Fiziği", (255, 107, 107)),
    ("🌀  18 Usta İşi Ahşap Parkur", (46, 213, 115)),
    ("🧩  100 Seviye & Derin Strateji", (30, 144, 255)),
]

pill_y = 250
for p_text, p_col in pills:
    p_bbox = font_pill.getbbox(p_text)
    pw = p_bbox[2] - p_bbox[0] + 32
    ph = p_bbox[3] - p_bbox[1] + 16
    
    # Pill background
    draw.rounded_rectangle([510 + 2, pill_y + 3, 510 + pw + 2, pill_y + ph + 3], radius=12, fill=(80, 40, 15, 50))
    draw.rounded_rectangle([510, pill_y, 510 + pw, pill_y + ph], radius=12, fill=(255, 255, 255, 220), outline=p_col, width=2)
    draw.text((510 + 16, pill_y + 7), p_text, font=font_pill, fill=(60, 30, 20))
    pill_y += ph + 14

# FloppaTech Corp watermark badge at bottom right
brand_text = "FLOPPATECH CORP"
b_bbox = font_brand.getbbox(brand_text)
bx = WIDTH - (b_bbox[2] - b_bbox[0]) - 35
by = HEIGHT - 40
draw.rounded_rectangle([bx - 12, by - 5, WIDTH - 23, by + 22], radius=8, fill=(255, 255, 255, 190), outline=(230, 200, 180, 200), width=1)
draw.text((bx, by), brand_text, font=font_brand, fill=(120, 80, 60))

# Save output
out_path = os.path.join(images_dir, "feature-graphic.png")
canvas = canvas.convert("RGB")
canvas.save(out_path, "PNG", optimize=True)
print(f"Generated Feature Graphic: {out_path} ({WIDTH}x{HEIGHT})")

# Copy to floppatechcorp public folder
floppa_target = r"c:\cevdet\Mobil\floppatechcorp\public\images\yumakpop\feature-graphic.png"
os.makedirs(os.path.dirname(floppa_target), exist_ok=True)
canvas.save(floppa_target, "PNG", optimize=True)
print(f"Synced to floppatechcorp: {floppa_target}")

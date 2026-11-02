import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

base_dir = r"c:\cevdet\Mobil\Wool Crush\yumak-pop"
assets_dir = os.path.join(base_dir, "assets")
images_dir = os.path.join(assets_dir, "images")
user_up_dir = r"C:\Users\efe_k\.gemini\antigravity\brain\c8055c0e-d459-4467-8137-6e8737f6fae8\.user_uploaded"

out_dir = os.path.join(images_dir, "store-screenshots")
os.makedirs(out_dir, exist_ok=True)

floppa_dir = r"c:\cevdet\Mobil\floppatechcorp\public\images\yumakpop\screenshots"
os.makedirs(floppa_dir, exist_ok=True)

WIDTH = 1080
HEIGHT = 1920

cards = [
    {
        "src": os.path.join(user_up_dir, "media_1793549094294_bb2b2e86.png"),
        "title": "CANLI ÖRGÜ SÖKÜLME FİZİĞİ",
        "sub": "Yılan kuyuya düşmeden doğru renkteki makaraları doldur!",
        "accent": (255, 107, 107),
        "name": "screenshot-1.png"
    },
    {
        "src": os.path.join(user_up_dir, "media_1793554075418_d4743ac4.png"),
        "title": "18 USTA PARKUR & 100 SEVİYE",
        "sub": "Yonca, sonsuzluk, kelt labirenti ve sarmal ahşap rotalar",
        "accent": (46, 213, 115),
        "name": "screenshot-2.png"
    },
    {
        "src": os.path.join(user_up_dir, "media_1793550706409_14d0ac4d.png"),
        "title": "FANTEZİ MAKARALAR & GÜÇLENDİRİCİLER",
        "sub": "Kilitli bobinler, sürpriz yumaklar, mıknatıs ve geri itme",
        "accent": (255, 165, 2),
        "name": "screenshot-3.png"
    },
    {
        "src": os.path.join(user_up_dir, "media_1793554158247_5973a363.png"),
        "title": "SICAK & SEVİMLİ ÖRGÜ EVRENİ",
        "sub": "Ahşap sevimli maskot ve rahatlatıcı el sanatı atmosferi",
        "accent": (155, 89, 182),
        "name": "screenshot-4.png"
    }
]

font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 46)
font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 25)

home_bg_path = os.path.join(images_dir, "home.jpg")
bg_base = Image.open(home_bg_path).convert("RGBA").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

for idx, c in enumerate(cards):
    canvas = bg_base.copy()
    draw = ImageDraw.Draw(canvas)
    
    # Top banner card
    draw.rounded_rectangle([40, 45, WIDTH - 40, 220], radius=28, fill=(255, 255, 255, 240), outline=c["accent"], width=3)
    
    # Title
    t_bbox = font_title.getbbox(c["title"])
    tw = t_bbox[2] - t_bbox[0]
    draw.text(((WIDTH - tw) // 2, 75), c["title"], font=font_title, fill=c["accent"])
    
    # Subtitle
    s_bbox = font_sub.getbbox(c["sub"])
    sw = s_bbox[2] - s_bbox[0]
    draw.text(((WIDTH - sw) // 2, 145), c["sub"], font=font_sub, fill=(90, 50, 40))
    
    # Process game screen
    if os.path.exists(c["src"]):
        game_img = Image.open(c["src"]).convert("RGBA")
        
        # Crop browser header if present (standard browser header is around 10% on top)
        # Check aspect ratio
        crop_top = 0
        if game_img.height > 1000:
            # Crop url bar if captured from browser
            crop_top = int(game_img.height * 0.08)
        
        game_cropped = game_img.crop((0, crop_top, game_img.width, game_img.height))
        
        # Scale to fit phone frame: target w: 860, h: 1600
        target_w = 860
        target_h = int(game_cropped.height * (target_w / game_cropped.width))
        if target_h > 1600:
            target_h = 1600
            target_w = int(game_cropped.width * (target_h / game_cropped.height))
            
        scaled_game = game_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Create rounded mask for phone screen
        mask = Image.new("L", (target_w, target_h), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.rounded_rectangle([0, 0, target_w, target_h], radius=32, fill=255)
        
        # Phone position
        px = (WIDTH - target_w) // 2
        py = 250
        
        # Phone shadow
        shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        sh_draw = ImageDraw.Draw(shadow)
        sh_draw.rounded_rectangle([px - 8, py - 4, px + target_w + 8, py + target_h + 16], radius=36, fill=(40, 20, 10, 80))
        shadow = shadow.filter(ImageFilter.GaussianBlur(16))
        canvas = Image.alpha_composite(canvas, shadow)
        
        # Paste phone screen
        canvas.paste(scaled_game, (px, py), mask)
        
        # Phone border outline
        draw.rounded_rectangle([px, py, px + target_w, py + target_h], radius=32, outline=(240, 220, 200, 255), width=3)
        
    out_file = os.path.join(out_dir, c["name"])
    canvas_rgb = canvas.convert("RGB")
    canvas_rgb.save(out_file, "JPEG", quality=92, optimize=True)
    print(f"Saved: {out_file}")
    
    # Also save to floppatechcorp
    floppa_file = os.path.join(floppa_dir, c["name"])
    canvas_rgb.save(floppa_file, "JPEG", quality=92, optimize=True)

print("All screenshots generated and synced successfully!")

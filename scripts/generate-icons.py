import os
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw

def generate_all_icons():
    base_dir = r'c:\cevdet\Mobil\Wool Crush\yumak-pop'
    assets_dir = os.path.join(base_dir, 'assets')
    images_dir = os.path.join(assets_dir, 'images')
    floppa_icon = r'c:\cevdet\Mobil\floppatechcorp\public\images\yumakpop\icon.png'

    bg_path = os.path.join(images_dir, 'bg.jpg')
    mascot_path = os.path.join(images_dir, 'mascot.png')

    bg = Image.open(bg_path)
    mascot = Image.open(mascot_path)

    # 1. Prepare 1024x1024 base background from bg.jpg
    w, h = bg.size
    crop_size = min(w, h)
    left = (w - crop_size) // 2
    top = (h - crop_size) // 3
    bg_square = bg.crop((left, top, left + crop_size, top + crop_size)).resize((1024, 1024), Image.Resampling.LANCZOS)

    # Enhance color and subtle brightness
    bg_square = ImageEnhance.Color(bg_square).enhance(1.18)
    bg_square = ImageEnhance.Brightness(bg_square).enhance(1.05)

    # Soft circular warm spotlight glow in center
    y, x = np.ogrid[:1024, :1024]
    dist = np.sqrt((x - 512)**2 + (y - 512)**2)
    mask = np.clip((1 - dist / 460.0), 0, 1)
    glow_arr = np.zeros((1024, 1024, 4), dtype=np.uint8)
    glow_arr[..., 0] = 255 # R
    glow_arr[..., 1] = 238 # G
    glow_arr[..., 2] = 215 # B
    glow_arr[..., 3] = (mask * 140).astype(np.uint8)
    glow = Image.fromarray(glow_arr, 'RGBA')
    bg_square = Image.alpha_composite(bg_square.convert('RGBA'), glow)

    # Mascot bbox
    crop_mascot = mascot.crop(mascot.getbbox())

    # --- A. Full App Store & Main Icon (1024x1024) ---
    icon_canvas = bg_square.copy()
    target_h_main = 780
    target_w_main = int(crop_mascot.width * (target_h_main / crop_mascot.height))
    scaled_main = crop_mascot.resize((target_w_main, target_h_main), Image.Resampling.LANCZOS)

    # Shadow for main icon
    s_w = int(target_w_main * 0.72)
    s_h = 54
    shadow_oval = Image.new('RGBA', (s_w, s_h), (55, 25, 12, 115))
    mask_im = Image.new('L', (s_w, s_h), 0)
    ImageDraw.Draw(mask_im).ellipse((0, 0, s_w, s_h), fill=255)
    shadow_oval.putalpha(mask_im)
    shadow_oval = shadow_oval.filter(ImageFilter.GaussianBlur(14))

    pos_x = (1024 - target_w_main) // 2
    pos_y = (1024 - target_h_main) // 2 + 10

    icon_canvas.paste(shadow_oval, ((1024 - s_w) // 2, pos_y + target_h_main - 38), shadow_oval)
    icon_canvas.paste(scaled_main, (pos_x, pos_y), scaled_main)

    # Save main icon.png
    icon_path = os.path.join(assets_dir, 'icon.png')
    icon_canvas.save(icon_path, 'PNG')
    print(f'Saved: {icon_path}')

    # Save 512x512 icon for store
    icon_512_path = os.path.join(images_dir, 'icon-512.png')
    icon_canvas.resize((512, 512), Image.Resampling.LANCZOS).save(icon_512_path, 'PNG')
    print(f'Saved: {icon_512_path}')

    # Save favicon 48x48
    favicon_path = os.path.join(assets_dir, 'favicon.png')
    icon_canvas.resize((48, 48), Image.Resampling.LANCZOS).save(favicon_path, 'PNG')
    print(f'Saved: {favicon_path}')

    # Copy to floppatechcorp showcase if exists
    if os.path.exists(os.path.dirname(floppa_icon)):
        icon_canvas.save(floppa_icon, 'PNG')
        print(f'Saved to floppatechcorp: {floppa_icon}')

    # --- B. Android Adaptive Icon Foreground (1024x1024, transparent, safe zone: ~630px tall) ---
    fg_canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    target_h_fg = 630
    target_w_fg = int(crop_mascot.width * (target_h_fg / crop_mascot.height))
    scaled_fg = crop_mascot.resize((target_w_fg, target_h_fg), Image.Resampling.LANCZOS)

    # Subtle shadow for foreground
    s_w_fg = int(target_w_fg * 0.70)
    s_h_fg = 44
    shadow_fg = Image.new('RGBA', (s_w_fg, s_h_fg), (60, 30, 15, 85))
    mask_fg = Image.new('L', (s_w_fg, s_h_fg), 0)
    ImageDraw.Draw(mask_fg).ellipse((0, 0, s_w_fg, s_h_fg), fill=255)
    shadow_fg.putalpha(mask_fg)
    shadow_fg = shadow_fg.filter(ImageFilter.GaussianBlur(10))

    fg_x = (1024 - target_w_fg) // 2
    fg_y = (1024 - target_h_fg) // 2 + 10

    fg_canvas.paste(shadow_fg, ((1024 - s_w_fg) // 2, fg_y + target_h_fg - 30), shadow_fg)
    fg_canvas.paste(scaled_fg, (fg_x, fg_y), scaled_fg)

    fg_path = os.path.join(assets_dir, 'android-icon-foreground.png')
    fg_canvas.save(fg_path, 'PNG')
    print(f'Saved: {fg_path}')

    # --- C. Splash Icon (1024x1024, transparent, ~680px tall) ---
    splash_canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    target_h_sp = 680
    target_w_sp = int(crop_mascot.width * (target_h_sp / crop_mascot.height))
    scaled_sp = crop_mascot.resize((target_w_sp, target_h_sp), Image.Resampling.LANCZOS)

    sp_x = (1024 - target_w_sp) // 2
    sp_y = (1024 - target_h_sp) // 2
    splash_canvas.paste(scaled_sp, (sp_x, sp_y), scaled_sp)

    splash_path = os.path.join(assets_dir, 'splash-icon.png')
    splash_canvas.save(splash_path, 'PNG')
    print(f'Saved: {splash_path}')

    print('All icons updated with the new yarn mascot!')

if __name__ == '__main__':
    generate_all_icons()

param([string]$Src, [string]$Dst)
# Converts generated JPG art into app assets (PNG, resized, white keyed out).
Add-Type -AssemblyName System.Drawing
$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
public static class ArtTool {
  public static Bitmap Resize(Image img, int w, int h) {
    var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(bmp)) {
      g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
      g.DrawImage(img, 0, 0, w, h);
    }
    return bmp;
  }
  // Flood-fill near-white pixels from the borders and make them transparent.
  public static void KeyWhite(Bitmap bmp) {
    int w = bmp.Width, h = bmp.Height;
    var data = bmp.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int stride = data.Stride; byte[] px = new byte[stride*h];
    System.Runtime.InteropServices.Marshal.Copy(data.Scan0, px, 0, px.Length);
    var seen = new bool[w*h]; var q = new Queue<int>();
    Func<int,int> lum = i => Math.Min(px[i], Math.Min(px[i+1], px[i+2]));
    for (int x=0;x<w;x++){ q.Enqueue(x); q.Enqueue((h-1)*w+x); }
    for (int y=0;y<h;y++){ q.Enqueue(y*w); q.Enqueue(y*w+w-1); }
    while (q.Count>0) {
      int p = q.Dequeue(); if (seen[p]) continue; seen[p]=true;
      int x=p%w, y=p/w; int i=y*stride+x*4; int l=lum(i);
      if (l < 200) continue;
      int a = l >= 238 ? 0 : (int)(255 * (238 - l) / 38.0);
      px[i+3] = (byte)Math.Min(px[i+3], a);
      if (l < 225) continue; // soft edge: do not spread further
      if (x>0) q.Enqueue(p-1); if (x<w-1) q.Enqueue(p+1);
      if (y>0) q.Enqueue(p-w); if (y<h-1) q.Enqueue(p+w);
    }
    System.Runtime.InteropServices.Marshal.Copy(px, 0, data.Scan0, px.Length);
    bmp.UnlockBits(data);
  }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$brain = 'C:\Users\efe_k\.gemini\antigravity\brain\c8055c0e-d459-4467-8137-6e8737f6fae8'
$assets = 'c:\cevdet\Mobil\Wool Crush\yumak-pop\assets'
New-Item -ItemType Directory -Force "$assets\images" | Out-Null
New-Item -ItemType Directory -Force 'c:\cevdet\Mobil\Wool Crush\art' | Out-Null
Copy-Item "$brain\*.jpg" 'c:\cevdet\Mobil\Wool Crush\art\' -Force

function Save($bmp, $path) { $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose(); Write-Output "saved $path" }

$icon = [System.Drawing.Image]::FromFile("$brain\icon_1793367053436.jpg")
Save ([ArtTool]::Resize($icon, 1024, 1024)) "$assets\icon.png"
Save ([ArtTool]::Resize($icon, 48, 48)) "$assets\favicon.png"
Save ([ArtTool]::Resize($icon, 512, 512)) "$assets\images\icon-512.png"
$icon.Dispose()

$fg = [System.Drawing.Image]::FromFile("$brain\adaptive_foreground_1793367093150.jpg")
$b = [ArtTool]::Resize($fg, 1024, 1024); [ArtTool]::KeyWhite($b); Save $b "$assets\android-icon-foreground.png"
$fg.Dispose()

$m = [System.Drawing.Image]::FromFile("$brain\mascot_1793367295627.jpg")
$b = [ArtTool]::Resize($m, 640, 640); [ArtTool]::KeyWhite($b); Save $b "$assets\images\mascot.png"
$b = [ArtTool]::Resize($m, 1024, 1024); [ArtTool]::KeyWhite($b); Save $b "$assets\splash-icon.png"
$m.Dispose()

$bg = [System.Drawing.Image]::FromFile("$brain\background_1793367126382.jpg")
$b = [ArtTool]::Resize($bg, 720, 1280)
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L
$b.Save("$assets\images\bg.jpg", $enc, $ep); $b.Dispose(); $bg.Dispose()

$sp = [System.Drawing.Image]::FromFile("$brain\splash_1793367315021.jpg")
$b = [ArtTool]::Resize($sp, 720, 1280); $b.Save("$assets\images\home.jpg", $enc, $ep); $b.Dispose(); $sp.Dispose()

Remove-Item "$assets\android-icon-background.png","$assets\android-icon-monochrome.png" -ErrorAction SilentlyContinue
Get-ChildItem $assets -Recurse | Select-Object FullName, Length

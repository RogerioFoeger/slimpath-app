# App Icons

Place your app icons in this directory with the following sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate Icons

### Option 1: Online Tools
1. Visit [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload your logo (512x512 recommended)
3. Download and extract to this folder

### Option 2: Using the Logo Image
Use the SlimPath AI logo provided in the project root and resize it to the required dimensions using any image editing tool (Photoshop, GIMP, etc.)

### Option 3: Quick Script (requires ImageMagick)

```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt install imagemagick

# Then run this script with your source image
for size in 72 96 128 144 152 192 384 512; do
  convert source-logo.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

## Requirements

- All icons should be PNG format
- Square aspect ratio (width = height)
- Transparent background recommended
- High quality source image (512x512 or larger)

## Current Status

⚠️ **Icons need to be added!** The app will work without them, but they're required for proper PWA installation and app store submissions.


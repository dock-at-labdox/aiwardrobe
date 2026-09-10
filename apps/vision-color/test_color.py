import io

from PIL import Image

from app.infrastructure.color_detection import detect_dominant_color

# Make a fake garment: a navy rectangle on a transparent background.
img = Image.new("RGBA", (120, 120), (0, 0, 0, 0))  # fully transparent
for x in range(30, 90):
    for y in range(20, 100):
        img.putpixel((x, y), (30, 60, 160, 255))  # navy, solid

buf = io.BytesIO()
img.save(buf, format="PNG")
data = buf.getvalue()

color = detect_dominant_color(data)
print("Detected dominant color (R, G, B):", color)

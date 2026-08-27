import io

from PIL import Image

from app.infrastructure.color_detection import analyze_color

img = Image.new("RGBA", (120, 120), (0, 0, 0, 0))
for x in range(30, 90):
    for y in range(20, 100):
        img.putpixel((x, y), (30, 60, 160, 255))  # navy
buf = io.BytesIO()
img.save(buf, format="PNG")

result = analyze_color(buf.getvalue())
print("RGB :", result.rgb)
print("LAB :", result.lab)
print("Name:", result.name)
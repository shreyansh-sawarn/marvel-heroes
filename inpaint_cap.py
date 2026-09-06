import cv2
import numpy as np

# Load cap_throw_scene.jpg
img = cv2.imread('public/assets/cap_throw_scene.jpg')
h, w, _ = img.shape
print(f'Image shape: {w}x{h}')

# Create mask for inpainting text areas
mask = np.zeros((h, w), dtype=np.uint8)

# 1. Top text: "CAPTAIN AMERICA"
# It is located roughly y: 20 to 140, x: 20 to 1250
# We detect the metallic/white text pixels in this upper band
top_roi = img[20:140, 20:1250]
top_gray = cv2.cvtColor(top_roi, cv2.COLOR_BGR2GRAY)
# The text has high contrast metallic borders and fill
_, top_thresh = cv2.threshold(top_gray, 140, 255, cv2.THRESH_BINARY)
# Also include dark shadow around letters
top_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
top_dilated = cv2.dilate(top_thresh, top_kernel, iterations=2)
mask[20:140, 20:1250] = top_dilated

# 2. Bottom-center text: "SHIELD THROW SUPERCUT"
# It is located y: 460 to 710, x: 340 to 860
bottom_roi = img[460:710, 340:860]
bottom_gray = cv2.cvtColor(bottom_roi, cv2.COLOR_BGR2GRAY)
# White text with black stroke: white is > 200, black stroke is < 50
white_mask = cv2.inRange(bottom_roi, np.array([170, 170, 170]), np.array([255, 255, 255]))
black_stroke = cv2.inRange(bottom_roi, np.array([0, 0, 0]), np.array([60, 60, 60]))
bot_text_mask = cv2.bitwise_or(white_mask, black_stroke)
# Dilate to cover boundaries
bot_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
bot_dilated = cv2.dilate(bot_text_mask, bot_kernel, iterations=2)
# Ensure we don't accidentally touch Steve on the left (Steve is x < 340 in that y range)
mask[460:710, 340:860] = bot_dilated

# Also mask Falcon on the right side if we want a pure Steve + Explosion battlefield!
# Falcon and his wings are on x > 850
# Let's check: in the user's screenshot, the scene focus is Captain America in the fiery explosion!
# Let's inpaint with radius 7
inpainted = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)

cv2.imwrite('public/assets/cap_explosion_battlefield_inpainted.jpg', inpainted)
print('Saved cap_explosion_battlefield_inpainted.jpg!')

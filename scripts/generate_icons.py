import zlib
import struct
import math
import os

def make_png(width, height, draw_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 9)
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    return bytes(png)

# 5x7 Font bitmaps for R, M, Q, G, S, I
GLYPHS = {
    'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
    'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
    'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
    'G': [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
    'S': [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
    'I': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
}

def is_pixel_in_text(nx, ny):
    lines = [
        ("RMR", -0.22),
        ("Q",   -0.10),
        ("GSI",  0.02)
    ]
    char_w = 0.048
    char_h = 0.068
    char_spacing = 0.012
    x_start = -0.26
    
    for text, y_top in lines:
        if y_top <= ny <= y_top + char_h:
            curr_x = x_start
            for ch in text:
                if curr_x <= nx <= curr_x + char_w:
                    glyph = GLYPHS.get(ch)
                    if glyph:
                        col = int((nx - curr_x) / char_w * 5)
                        row = int((ny - y_top) / char_h * 7)
                        col = max(0, min(4, col))
                        row = max(0, min(6, row))
                        if (glyph[row] >> (4 - col)) & 1:
                            return True
                curr_x += char_w + char_spacing
    return False

def draw_tunnel_icon_pixel(x, y, w, h, is_maskable=False):
    nx = (x - w / 2) / (w / 2)
    ny = (y - h / 2) / (h / 2)
    
    if is_maskable:
        nx = nx * 1.25
        ny = ny * 1.25
    
    sq_dist = (abs(nx)**4.5 + abs(ny)**4.5)**(1/4.5)
    if not is_maskable and sq_dist > 0.98:
        return (0, 0, 0, 0)
        
    r = int(9 + 12 * (1 - ny))
    g = int(18 + 14 * (1 - ny))
    b = int(36 + 22 * (1 - ny))
    
    vp_x = 0.0
    vp_y = 0.28
    
    is_road = False
    if ny > vp_y:
        t = (ny - vp_y) / (1.0 - vp_y)
        half_width = 0.78 * t
        if abs(nx) <= half_width:
            is_road = True
            r, g, b = 14, 22, 38
            if abs(abs(nx) - half_width) < 0.045:
                r, g, b = 245, 158, 11
            if abs(nx) < 0.025 * (0.3 + 0.7 * t):
                dash_period = (ny - vp_y) * 12
                if int(dash_period) % 2 == 1:
                    r, g, b = 251, 191, 36
                    
    dist_to_light = math.sqrt((nx - vp_x)**2 + (ny - vp_y)**2)
    if dist_to_light < 0.08 and ny <= vp_y + 0.04:
        r, g, b = 251, 191, 36

    arch_cx = 0.0
    arch_cy = -0.08
    arch_dx = nx - arch_cx
    arch_dy = ny - arch_cy
    
    ro = 0.58
    ri = 0.38
    r_yellow_out = 0.46
    r_yellow_in = 0.38
    
    in_outer_horseshoe = False
    in_inner_horseshoe = False
    in_yellow_horseshoe = False
    
    if arch_dy <= 0:
        dist_arch = math.sqrt(arch_dx**2 + arch_dy**2)
        if dist_arch <= ro:
            in_outer_horseshoe = True
        if dist_arch <= ri:
            in_inner_horseshoe = True
        if dist_arch <= r_yellow_out and dist_arch >= r_yellow_in:
            in_yellow_horseshoe = True
    else:
        if arch_dy <= 0.56:
            if abs(arch_dx) <= ro:
                in_outer_horseshoe = True
            if abs(arch_dx) <= ri:
                in_inner_horseshoe = True
            if abs(arch_dx) <= r_yellow_out and abs(arch_dx) >= r_yellow_in:
                in_yellow_horseshoe = True

    in_footing = False
    if 0.42 <= ny <= 0.64:
        if -0.68 <= nx <= -0.42 or 0.42 <= nx <= 0.68:
            in_footing = True

    if in_footing:
        r, g, b = 90, 115, 145

    if in_outer_horseshoe and not in_inner_horseshoe and not in_footing:
        r, g, b = 150, 170, 195
        if in_yellow_horseshoe:
            r, g, b = 245, 158, 11

    if not in_outer_horseshoe and not is_road and not in_footing:
        facet = math.sin(nx * 5 + ny * 3) + math.cos(nx * 3 - ny * 7)
        if facet > 0.4:
            r, g, b = 35, 55, 88
        elif facet > -0.3:
            r, g, b = 24, 38, 62
        else:
            r, g, b = 15, 25, 42
            
        joint = abs((nx * 0.8 + ny * 1.2 + 0.2) % 0.65 - 0.32)
        if joint < 0.015 and (abs(nx) > 0.5 or ny < -0.4):
            r, g, b = 245, 158, 11

    gx0, gy0 = -0.34, 0.34
    
    if abs(nx - gx0) < 0.015 and -0.24 <= ny <= gy0:
        r, g, b = 253, 224, 71
    if -0.28 <= ny <= -0.24 and abs(nx - gx0) <= (ny - (-0.28)) * 0.7:
        r, g, b = 253, 224, 71

    if abs(ny - gy0) < 0.015 and gx0 <= nx <= 0.38:
        r, g, b = 253, 224, 71
    if 0.38 <= nx <= 0.42 and abs(ny - gy0) <= (0.42 - nx) * 0.7:
        r, g, b = 253, 224, 71

    if is_pixel_in_text(nx, ny):
        r, g, b = 253, 224, 71
        
    points = [
        (-0.28, 0.28),
        (-0.15, 0.22),
        (0.00, 0.14),
        (0.16, 0.06),
        (0.32, -0.04),
    ]
    
    for i in range(len(points) - 1):
        x1, y1 = points[i]
        x2, y2 = points[i+1]
        l2 = (x2 - x1)**2 + (y2 - y1)**2
        t = max(0.0, min(1.0, ((nx - x1)*(x2 - x1) + (ny - y1)*(y2 - y1)) / l2))
        proj_x = x1 + t * (x2 - x1)
        proj_y = y1 + t * (y2 - y1)
        dist_line = math.sqrt((nx - proj_x)**2 + (ny - proj_y)**2)
        if dist_line < 0.016:
            r, g, b = 253, 224, 71
            
    for px, py in points:
        d = math.sqrt((nx - px)**2 + (ny - py)**2)
        if d <= 0.038:
            r, g, b = 253, 224, 71
        elif d <= 0.048:
            r, g, b = 255, 255, 255
            
    return (r, g, b, 255)

def make_classic_win32_ico(sizes, draw_func, output_path):
    """
    Creates a 100% compliant, uncompressed Win32 DIB ICO file.
    Does NOT use PNG compression, ensuring total compatibility with
    csc.exe /win32icon across every version of Windows without CS1583 error.
    """
    count = len(sizes)
    header = struct.pack('<HHH', 0, 1, count)
    entries = bytearray()
    images_data = bytearray()
    
    offset = 6 + count * 16
    
    for sz in sizes:
        w, h = sz, sz
        
        # Calculate DIB payload (32-bit BGRA bottom-up + 1-bit AND mask)
        pixels = bytearray()
        for y in range(h - 1, -1, -1):
            for x in range(w):
                r, g, b, a = draw_func(x, y, w, h)
                pixels.extend([b, g, r, a]) # BGRA order
                
        # AND mask row size (rounded up to 4 bytes boundary)
        row_bytes = ((w + 31) // 32) * 4
        and_mask = bytearray(row_bytes * h) # All 0s (fully opaque where alpha > 0)
        
        # BitmapInfoHeader (height is doubled: h * 2)
        bih = struct.pack('<IIIHHIIIIII',
            40,         # biSize
            w,          # biWidth
            h * 2,      # biHeight
            1,          # biPlanes
            32,         # biBitCount
            0,          # biCompression (BI_RGB)
            len(pixels) + len(and_mask), # biSizeImage
            0, 0, 0, 0
        )
        
        image_bytes = bih + bytes(pixels) + bytes(and_mask)
        images_data.extend(image_bytes)
        
        width_byte = 0 if w >= 256 else w
        height_byte = 0 if h >= 256 else h
        entry = struct.pack('<BBBBHHII', width_byte, height_byte, 0, 0, 1, 32, len(image_bytes), offset)
        entries.extend(entry)
        offset += len(image_bytes)
        
    with open(output_path, 'wb') as f:
        f.write(header)
        f.write(entries)
        f.write(images_data)

os.makedirs('public', exist_ok=True)
os.makedirs('build', exist_ok=True)

print("Generating pwa-192x192.png...")
png_192 = make_png(192, 192, lambda x, y, w, h: draw_tunnel_icon_pixel(x, y, w, h, False))
with open('public/pwa-192x192.png', 'wb') as f:
    f.write(png_192)

print("Generating pwa-512x512.png...")
png_512 = make_png(512, 512, lambda x, y, w, h: draw_tunnel_icon_pixel(x, y, w, h, False))
with open('public/pwa-512x512.png', 'wb') as f:
    f.write(png_512)

print("Generating pwa-maskable-512x512.png...")
png_maskable = make_png(512, 512, lambda x, y, w, h: draw_tunnel_icon_pixel(x, y, w, h, True))
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(png_maskable)

print("Generating apple-touch-icon.png...")
png_apple = make_png(180, 180, lambda x, y, w, h: draw_tunnel_icon_pixel(x, y, w, h, False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_apple)

# Classic Win32 uncompressed DIB ICO files (100% compliant with csc.exe)
print("Generating uncompressed Win32 ICO files (16, 32, 48)...")
make_classic_win32_ico([16, 32, 48], draw_tunnel_icon_pixel, 'build/icon.ico')
make_classic_win32_ico([16, 32, 48], draw_tunnel_icon_pixel, 'public/favicon.ico')

print("All icons and Win32 ICO files generated successfully!")

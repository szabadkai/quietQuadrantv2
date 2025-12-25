import os
import subprocess
import re

# Configuration
INPUT_DIR = "/Users/lszabadkai/quietQuadrantv2/public/assets/upgrades"
OUTPUT_DIR = "/Users/lszabadkai/quietQuadrantv2/public/assets/upgrades"

# Mapping of (Row, Col, UpgradeID)
BATCH_1_MAP = [
    (0, 0, "power-shot"), (0, 1, "rapid-fire"), (0, 2, "swift-projectiles"), (0, 3, "engine-tune"),
    (1, 0, "plating"), (1, 1, "sidecar"), (1, 2, "pierce"), (1, 3, "heavy-barrel"),
    (2, 0, "rebound"), (2, 1, "dash-sparks"), (2, 2, "held-charge"), (2, 3, "shield-pickup"),
    (3, 0, "magnet-coil"), (3, 1, "stabilizers"), (3, 2, "shrapnel"), (3, 3, "kinetic-siphon"),
]

BATCH_2_MAP = [
    (0, 0, "prism-spread"), (0, 1, "momentum-feed"), (0, 2, "split-shot"), (0, 3, "explosive-impact"),
    (1, 0, "chain-arc"), (1, 1, "heatseeker"), (1, 2, "blood-fuel"), (1, 3, "chain-reaction"),
    (2, 0, "quantum-tunneling"), (2, 1, "berserk-module"), (2, 2, "neutron-core"), (2, 3, "glass-cannon"),
    (3, 0, "singularity-rounds"), (3, 1, "bullet-hell"),
]

def get_dimensions(path):
    try:
        output = subprocess.check_output(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path]).decode("utf-8")
        w_match = re.search(r"pixelWidth: (\d+)", output)
        h_match = re.search(r"pixelHeight: (\d+)", output)
        if w_match and h_match:
            return int(w_match.group(1)), int(h_match.group(1))
    except Exception as e:
        print(f"Error getting dims for {path}: {e}")
    return None, None

def slice_batch(filename, mapping):
    in_path = os.path.join(INPUT_DIR, filename)
    if not os.path.exists(in_path):
        print(f"File missing: {in_path}")
        return

    width, height = get_dimensions(in_path)
    if not width:
        print(f"Could not read dimensions for {filename}")
        return

    tile_w = width // 4
    tile_h = height // 4
    
    print(f"Processing {filename} ({width}x{height}) -> {tile_w}x{tile_h} tiles")

    for row, col, upgrade_id in mapping:
        out_name = f"{upgrade_id}.png"
        out_path = os.path.join(OUTPUT_DIR, out_name)
        
        # Calculate offsets
        # sips --cropOffset <y> <x>
        off_x = col * tile_w
        off_y = row * tile_h
        
        # Note: sips crop logic is a bit weird. 
        # --cropToHeightWidth <height> <width>
        # --cropOffset <y> <x> (from top-left)
        
        # We perform valid crop by copying to temp then cropping? 
        # No, sips modifies in place usually, unless --out is used.
        # We must use --out to avoid destroying source.
        
        cmd = [
            "sips",
            "-s", "format", "png",
            "--cropToHeightWidth", str(tile_h), str(tile_w),
            "--cropOffset", str(off_y), str(off_x),
            in_path,
            "--out", out_path
        ]
        
        try:
            # Sips is chatty, suppress output unless error
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
            print(f"Created {out_name}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to create {out_name}: {e}")

if __name__ == "__main__":
    slice_batch("batch_1.png", BATCH_1_MAP)
    slice_batch("batch_2.png", BATCH_2_MAP)

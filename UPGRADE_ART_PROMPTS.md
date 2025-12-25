# Upgrade Art Generation Prompts (C64 & Vectrex Style)

This document contains specialized prompts for generating upgrade icons and artwork in the retro styles of the **Commodore 64** and **Vectrex**. These prompts are designed to create a **tilemap/tileset** for easy integration.

---

## 🎨 Style 1: C64 Pixel Art (Multicolor Mode)
*Focus: Low-resolution, 16-color palette (browns, cyans, grays), chunky pixels.*

### Global Tileset Prompt:
> **Prompt:** A professional 16x16 pixel art tileset for a sci-fi action game. C64 multicolor mode aesthetics, limited 16-color palette (black, white, red, cyan, purple, green, blue, yellow, orange, brown, light red, dark grey, grey, light green, light blue, light grey). Each tile is 16x16 pixels. The icons represent ship upgrades: 1. A glowing bullet (Power), 2. A lightning bolt (Speed), 3. A steel shield (Armor), 4. A magnet (Pickup), 5. A stylized engine (Mobility), 6. An explosion (Area Damage). Sharp pixel boundaries, no gradients, black background. Top-down retro computer game style.

---

## 🛰️ Style 2: Vectrex Vector Glow
*Focus: Sharp neon lines, black background, phosphor bloom, inner line detail.*

### Global Tileset Prompt:
> **Prompt:** A spritesheet of minimalist vector icons on a pitch black background. Vectrex console style, high-contrast cyan glowing lines (#00FFFF). Monolinear strokes, wireframe aesthetic. The icons represent game upgrades: 1. A concentric circle pulse (Shockwave), 2. A triangle within a triangle (Rank Up), 3. Three parallel diagonal lines (Rapid Fire), 4. A hollow geometric heart (Life), 5. A crosshair (Precision), 6. A jagged spark (Critical Hit). Intense neon glow, phosphor trail effect, CRT scanline artifacts. Each icon centered in a grid.

---

## 🛠️ Specialized Upgrade Prompts (Individual/Strip)

### Offense Upgrades (The "Aggressor" Set)
> **Prompt:** Pixel art icons tileset for "Offense Upgrades". C64 palette. Icons: 🎯 (Targeting Core), 💣 (Volatile Compounds), ⚡ (Chain Arc), 💠 (Prism Spread). Retro HUD style, 16x16 per icon, sharp pixels, black background, high contrast cyan and yellow highlights.

### Defense Upgrades (The "Sentinel" Set)
> **Prompt:** Vector line art icons tileset for "Defense Upgrades". Vectrex style. Icons: 🛡️ (Light Plating), 🌀 (Neutron Core), 🧿 (XP Shield), ⏹️ (Stabilizers). Pure glow-line aesthetic, cyan neon, geometric minimalism, black background.

---

## 💡 Generation Tips for Best Results:
1. **Resolution:** If generating with DALL-E or Midjourney, append "pixel-perfect" or "monolinear vector" to avoid "mushy" results.
2. **Grid Alignment:** Use "organized in a neat grid" to ensure the tileset is easy to slice.
3. **Aspect Ratio:** Use `--ar 1:1` for square tilesets.
4. **Post-Processing:** After generation, it is recommended to run the image through a **limited palette filter** or **ImageMagick** to snap colors to the exact `--qq-accent` (#00FFFF) used in the HUD.

---

## 🚀 Upgrade List for Reference:
*   **Power Shot:** Glowing bullet silhouette.
*   **Rapid Fire:** Triple chevron arrows.
*   **Dash Sparks:** Exploding jagged lines.
*   **Magnet Coil:** U-shaped Horseshoe magnet.
*   **Glass Cannon:** A cracked crystal sphere.
*   **Singularity Rounds:** A black circle with inward-pointing arrows.

export class TextureValidator {
    static validateSprite(sprite, fallbackKey, scene) {
        if (!sprite) return false;

        // Check if texture or frame is missing/invalid
        if (!sprite.texture || !sprite.frame || sprite.frame.name === "__MISSING") {
            // Attempt to recover with fallback
            if (scene && fallbackKey && scene.textures.exists(fallbackKey)) {
                sprite.setTexture(fallbackKey);
                
                // Re-check validity (check if fallback has a valid frame)
                if (!sprite.frame || sprite.frame.name === "__MISSING") {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Check for invalid dimensions which can crash pipelines
        if (sprite.frame.width <= 0 || sprite.frame.height <= 0) {
            return false;
        }

        // Additional FX Pipeline safety: ensure custom pipelines have data they need
        // (Though usually, valid frame + texture is enough)

        return true;
    }

    static validateTextureKey(scene, key, fallbackKey) {
        if (scene.textures.exists(key)) return key;
        if (fallbackKey && scene.textures.exists(fallbackKey)) return fallbackKey;
        return "__MISSING";
    }
}

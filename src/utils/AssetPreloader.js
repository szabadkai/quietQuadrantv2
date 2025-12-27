/**
 * Asset preloader for background loading during pre-title and menu screens.
 * Pre-rasterizes SVG sprites to canvas and stores them for injection into Phaser.
 */

import { SPRITE_ASSETS } from "../rendering/sprites.js";

function resolveAssetPath(path) {
    const cleaned = String(path || "").replace(/^\/+/, "");
    return `./${cleaned}`;
}

// Music tracks to preload (matching MusicManager.js)
const MUSIC_TRACKS = [
    resolveAssetPath("music/Juhani Junkala [Retro Game Music Pack] Ending.mp3"),
    resolveAssetPath("music/Juhani Junkala [Retro Game Music Pack] Level 2.mp3"),
    resolveAssetPath("music/Juhani Junkala [Retro Game Music Pack] Level 3.mp3"),
];

// Videos to preload (defeat first as it's more commonly played)
const VIDEO_ASSETS = [
    resolveAssetPath("assets/defeat.mp4"),
    resolveAssetPath("assets/victory.mp4"),
];

class AssetPreloaderClass {
    constructor() {
        this.loading = false;
        this.complete = false;
        this.loadedCount = 0;
        this.totalCount = 0;
        this.promise = null;
        // Store pre-rasterized sprite images for Phaser injection
        this.rasterizedSprites = new Map();
    }

    /**
     * Start preloading all game assets.
     * Returns a promise that resolves when all assets are loaded.
     * Safe to call multiple times - will only load once.
     */
    preloadAll() {
        if (this.promise) return this.promise;

        this.loading = true;
        this.totalCount = SPRITE_ASSETS.length + MUSIC_TRACKS.length + VIDEO_ASSETS.length;
        this.loadedCount = 0;

        // Detect mobile for size multiplier (matching GameRenderer logic)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const sizeMultiplier = isMobile ? 2 : 1;

        const spritePromises = SPRITE_ASSETS.map((asset) => 
            this.preloadAndRasterizeSVG(asset.key, asset.file, asset.size * sizeMultiplier)
        );
        const musicPromises = MUSIC_TRACKS.map((url) => this.preloadAudio(url));
        const videoPromises = VIDEO_ASSETS.map((url) => this.preloadVideo(url));

        this.promise = Promise.allSettled([...spritePromises, ...musicPromises, ...videoPromises])
            .then((results) => {
                const succeeded = results.filter((r) => r.status === "fulfilled").length;
                console.log(`[AssetPreloader] Completed: ${succeeded}/${this.totalCount} assets (${this.rasterizedSprites.size} sprites rasterized)`);
                this.loading = false;
                this.complete = true;
                return true;
            })
            .catch((err) => {
                console.warn("[AssetPreloader] Error during preload:", err);
                this.loading = false;
                this.complete = true;
                return false;
            });

        return this.promise;
    }

    /**
     * Load SVG and rasterize it to an Image with the correct size.
     * This pre-renders the SVG so Phaser can use it instantly.
     */
    preloadAndRasterizeSVG(key, url, size) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Create a canvas to rasterize the SVG at the target size
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, size, size);
                
                // Create a new image from the canvas (fully rasterized)
                const rasterized = new Image();
                rasterized.onload = () => {
                    this.rasterizedSprites.set(key, rasterized);
                    this.loadedCount++;
                    resolve(key);
                };
                rasterized.onerror = () => {
                    // Fall back to original image if canvas export fails
                    this.rasterizedSprites.set(key, img);
                    this.loadedCount++;
                    resolve(key);
                };
                rasterized.src = canvas.toDataURL("image/png");
            };
            img.onerror = () => {
                this.loadedCount++;
                reject(new Error(`Failed to load: ${url}`));
            };
            img.src = url;
        });
    }

    preloadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = "auto";
            
            const handleLoad = () => {
                cleanup();
                this.loadedCount++;
                resolve(url);
            };
            
            const handleError = () => {
                cleanup();
                this.loadedCount++;
                reject(new Error(`Failed to load: ${url}`));
            };

            const cleanup = () => {
                audio.removeEventListener("canplaythrough", handleLoad);
                audio.removeEventListener("error", handleError);
            };

            audio.addEventListener("canplaythrough", handleLoad, { once: true });
            audio.addEventListener("error", handleError, { once: true });
            audio.src = url;
            audio.load();
            
            // Fallback timeout - don't block forever if audio doesn't fire events
            setTimeout(() => {
                if (this.loadedCount < this.totalCount) {
                    cleanup();
                    this.loadedCount++;
                    resolve(url); // Resolve anyway, browser may have cached it
                }
            }, 5000);
        });
    }

    preloadVideo(url) {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = "auto";
            
            const handleLoad = () => {
                cleanup();
                this.loadedCount++;
                resolve(url);
            };
            
            const handleError = () => {
                cleanup();
                this.loadedCount++;
                reject(new Error(`Failed to load video: ${url}`));
            };

            const cleanup = () => {
                video.removeEventListener("canplaythrough", handleLoad);
                video.removeEventListener("error", handleError);
            };

            video.addEventListener("canplaythrough", handleLoad, { once: true });
            video.addEventListener("error", handleError, { once: true });
            video.src = url;
            video.load();
            
            // Fallback timeout - videos can be large
            setTimeout(() => {
                if (this.loadedCount < this.totalCount) {
                    cleanup();
                    this.loadedCount++;
                    resolve(url); // Resolve anyway, browser may have cached it
                }
            }, 10000);
        });
    }

    /**
     * Get pre-rasterized sprite image by key.
     * Returns the Image element if available, null otherwise.
     */
    getRasterizedSprite(key) {
        return this.rasterizedSprites.get(key) || null;
    }

    /**
     * Check if a specific sprite has been pre-rasterized.
     */
    hasSprite(key) {
        return this.rasterizedSprites.has(key);
    }

    /**
     * Inject all pre-rasterized sprites into Phaser's texture manager.
     * Call this in GameRenderer.preload() before normal loading.
     */
    injectIntoPhaser(scene) {
        let injected = 0;
        for (const [key, img] of this.rasterizedSprites.entries()) {
            if (!scene.textures.exists(key)) {
                scene.textures.addImage(key, img);
                injected++;
            }
        }
        if (injected > 0) {
            console.log(`[AssetPreloader] Injected ${injected} pre-rasterized sprites into Phaser`);
        }
        return injected;
    }

    isComplete() {
        return this.complete;
    }

    isLoading() {
        return this.loading;
    }

    getProgress() {
        if (this.totalCount === 0) return 0;
        return this.loadedCount / this.totalCount;
    }
}

export const AssetPreloader = new AssetPreloaderClass();

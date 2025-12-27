/**
 * Network utility functions for connection-aware video loading
 */

// Cache for preloaded videos
const videoCache = new Map();

/**
 * Check if running in Electron (native build)
 * @returns {boolean}
 */
export function isElectron() {
    // Check for Electron-specific properties
    return !!(
        (typeof window !== 'undefined' && window.process && window.process.type) ||
        (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron'))
    );
}

/**
 * Check if the current connection is slow (3G or slower)
 * Never returns true for Electron builds (native apps run locally)
 * @returns {boolean} True if connection is slow or unknown/metered
 */
export function isSlowConnection() {
    // Never skip videos in native Electron builds
    if (isElectron()) {
        console.log('[NetworkUtils] Running in Electron, always fast connection');
        return false;
    }

    // Use the Network Information API if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
        // If API not available, assume fast connection (desktop browsers often lack this)
        return false;
    }
    
    // Check effective connection type
    const effectiveType = connection.effectiveType;
    
    // 'slow-2g', '2g', '3g' are considered slow
    // '4g' is considered fast
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') {
        console.log(`[NetworkUtils] Slow connection detected: ${effectiveType}`);
        return true;
    }
    
    // Also check if user has data saver enabled
    if (connection.saveData) {
        console.log('[NetworkUtils] Data saver mode enabled');
        return true;
    }
    
    // Check downlink speed (Mbps) - if below 1.5 Mbps, consider it slow
    if (connection.downlink !== undefined && connection.downlink < 1.5) {
        console.log(`[NetworkUtils] Low bandwidth detected: ${connection.downlink} Mbps`);
        return true;
    }
    
    return false;
}

/**
 * Preload and cache a video
 * @param {string} src - Video source URL
 * @returns {Promise<HTMLVideoElement>} The preloaded video element
 */
export function preloadVideo(src) {
    // Return cached video if already loaded
    if (videoCache.has(src)) {
        return Promise.resolve(videoCache.get(src));
    }
    
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.playsInline = true;
        video.muted = true; // Muted for initial preload
        
        const handleCanPlayThrough = () => {
            video.removeEventListener('canplaythrough', handleCanPlayThrough);
            video.removeEventListener('error', handleError);
            videoCache.set(src, video);
            console.log(`[NetworkUtils] Video cached: ${src}`);
            resolve(video);
        };
        
        const handleError = (e) => {
            video.removeEventListener('canplaythrough', handleCanPlayThrough);
            video.removeEventListener('error', handleError);
            console.error(`[NetworkUtils] Failed to preload video: ${src}`, e);
            reject(e);
        };
        
        video.addEventListener('canplaythrough', handleCanPlayThrough);
        video.addEventListener('error', handleError);
        
        video.src = src;
        video.load();
    });
}

/**
 * Check if a video is already cached
 * @param {string} src - Video source URL
 * @returns {boolean}
 */
export function isVideoCached(src) {
    return videoCache.has(src);
}

/**
 * Get a cached video element
 * @param {string} src - Video source URL
 * @returns {HTMLVideoElement|null}
 */
export function getCachedVideo(src) {
    return videoCache.get(src) || null;
}

/**
 * Clear the video cache
 */
export function clearVideoCache() {
    videoCache.forEach((video) => {
        video.src = '';
        video.load();
    });
    videoCache.clear();
    console.log('[NetworkUtils] Video cache cleared');
}

/**
 * Monitor connection changes
 * @param {function} callback - Called with (isSlowConnection) when connection changes
 * @returns {function} Cleanup function to remove listener
 */
export function onConnectionChange(callback) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
        return () => {}; // No-op cleanup if API not available
    }
    
    const handleChange = () => {
        callback(isSlowConnection());
    };
    
    connection.addEventListener('change', handleChange);
    
    return () => {
        connection.removeEventListener('change', handleChange);
    };
}

const SETTINGS_KEY = "quiet-quadrant-settings";
const DEFAULT_SETTINGS = {
    screenShake: true,
    screenFlash: true,
    reducedMotion: false,
    damageNumbers: false,
    highContrast: false,
    crtScanlines: true,
    crtIntensity: 0.5,
    colorTheme: "vectrex",
    lowFX: false, // Performance mode: disables glow effects
};

export function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
        // ignore
    }
    return { ...DEFAULT_SETTINGS };
}

export function applyBodyClasses(settings) {
    if (typeof document === "undefined") return;
    document.body.classList.toggle(
        "qq-high-contrast",
        settings.highContrast ?? false
    );
    document.body.classList.toggle(
        "qq-reduced-motion",
        settings.reducedMotion ?? false
    );
    document.body.classList.toggle(
        "qq-no-scanlines",
        !(settings.crtScanlines ?? true)
    );

    // Apply CRT intensity as CSS variable
    const intensity = settings.crtScanlines ? settings.crtIntensity ?? 0.5 : 0;
    document.documentElement.style.setProperty("--crt-intensity", intensity);
    document.documentElement.style.setProperty("--glow-intensity", intensity);

    // Apply color theme
    const theme = settings.colorTheme || "vectrex";
    document.body.setAttribute("data-theme", theme);
}

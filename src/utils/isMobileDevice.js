export function isMobileDevice() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const touchPoints = navigator.maxTouchPoints || 0;
    const hasTouch = "ontouchstart" in window || touchPoints > 0;
    const isMobileUA =
        /Mobi|Android|iPhone|iPad|iPod|Silk|Mobile|CriOS|FxiOS/i.test(ua);
    // Detect touch-capable device with small screen as mobile
    const isSmallScreen = window.matchMedia?.("(max-width: 1024px)").matches;
    return isMobileUA || (hasTouch && isSmallScreen);
}

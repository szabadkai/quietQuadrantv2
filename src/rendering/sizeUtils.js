export function safeSize(value, min = 1) {
    const numeric = Number.isFinite(value) ? value : min;
    return Math.max(min, numeric);
}

export function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const BASE_WITH_SLASH = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;

// Builds a path to upgrade art that respects Vite's base path (e.g., GitHub Pages).
export function getUpgradeIconPath(id) {
    return `${BASE_WITH_SLASH}assets/upgrades/${id}.png`;
}

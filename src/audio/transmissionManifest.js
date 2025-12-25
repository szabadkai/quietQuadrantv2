import DEFAULT_MANIFEST from "./transmissionManifest.json";

const GENERAL_TRANSMISSIONS = DEFAULT_MANIFEST.general || [];

const UPGRADE_CATEGORY_TO_POOL = {
    offense: "weapons",
    defense: "defense",
    utility: "utility",
    legendary: "legendary",
};

function cloneManifest(manifest) {
    return JSON.parse(JSON.stringify(manifest));
}

function mergeManifest(manifest) {
    const merged = cloneManifest(DEFAULT_MANIFEST);
    if (Array.isArray(manifest?.general) && manifest.general.length) {
        merged.general = manifest.general;
    }
    for (const section of [
        "health",
        "enemies",
        "upgrades",
        "bosses",
        "wave",
        "milestone",
    ]) {
        if (!manifest?.[section]) continue;
        merged[section] = merged[section] ?? {};
        for (const [key, value] of Object.entries(manifest[section])) {
            if (Array.isArray(value) && value.length) {
                merged[section][key] = value;
            }
        }
    }
    return merged;
}

export {
    DEFAULT_MANIFEST,
    GENERAL_TRANSMISSIONS,
    UPGRADE_CATEGORY_TO_POOL,
    cloneManifest,
    mergeManifest,
};

export const ELITE_MODIFIERS = {
    health: 1.8,
    speed: 1.3,
    damage: 1.25,
};

export const ENEMIES = {
    drifter: {
        type: "drifter",
        name: "Drifter",
        health: 12,
        speed: 115,
        radius: 10,
        contactDamage: 1,
        xp: 10,
        eliteBehavior: "burst",
    },
    watcher: {
        type: "watcher",
        name: "Watcher",
        health: 45,
        speed: 75,
        radius: 10,
        contactDamage: 1,
        xp: 10,
        bulletDamage: 1,
        bulletSpeed: 165,
        fireCooldownTicks: 90,
        eliteBehavior: "rapid-fire",
    },
    mass: {
        type: "mass",
        name: "Mass",
        health: 110,
        speed: 50,
        radius: 11,
        contactDamage: 2,
        xp: 10,
        bulletDamage: 1,
        bulletSpeed: 125,
        fireCooldownTicks: 144,
        eliteBehavior: "burst-death",
    },
    phantom: {
        type: "phantom",
        name: "Phantom",
        health: 24,
        speed: 95,
        radius: 12,
        contactDamage: 1,
        xp: 10,
        eliteBehavior: "burst",
    },
    orbiter: {
        type: "orbiter",
        name: "Orbiter",
        health: 36,
        speed: 135,
        radius: 10,
        contactDamage: 1,
        xp: 10,
        bulletDamage: 1,
        bulletSpeed: 150,
        fireCooldownTicks: 114,
        eliteBehavior: "rapid-fire",
    },
    splitter: {
        type: "splitter",
        name: "Splitter",
        health: 65,
        speed: 65,
        radius: 11,
        contactDamage: 1,
        xp: 10,
        eliteBehavior: "death-explosion",
    },
    // === DECK-SCALED ENEMIES (unlock with progression) ===
    charger: {
        type: "charger",
        name: "Charger",
        health: 30,
        speed: 180,
        radius: 9,
        contactDamage: 2,
        xp: 15,
        eliteBehavior: "burst",
        // Charges at player, pauses, then charges again
        chargeCooldown: 90,
        chargeSpeed: 350,
        chargeDuration: 30,
    },
    shielder: {
        type: "shielder",
        name: "Shielder",
        health: 80,
        speed: 55,
        radius: 12,
        contactDamage: 1,
        xp: 20,
        eliteBehavior: "rapid-fire",
        bulletDamage: 1,
        bulletSpeed: 140,
        fireCooldownTicks: 120,
        // Frontal shield blocks shots from one direction
        shieldArc: Math.PI * 0.6,
    },
    bomber: {
        type: "bomber",
        name: "Bomber",
        health: 40,
        speed: 70,
        radius: 11,
        contactDamage: 1,
        xp: 20,
        eliteBehavior: "burst-death",
        // Explodes on death
        explosionRadius: 60,
        explosionDamage: 2,
    },
};

// Enemies that unlock based on deck progression
// threshold = minimum (boosts + unlocks) to enable this enemy
export const SCALED_ENEMIES = [
    { type: "charger", threshold: 1 }, // After 1st boss
    { type: "shielder", threshold: 3 }, // After ~3 bosses
    { type: "bomber", threshold: 5 }, // After ~5 bosses
];

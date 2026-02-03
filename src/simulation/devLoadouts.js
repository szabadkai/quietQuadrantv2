// Simple developer loadouts for testing purposes
export const DEV_LOADOUTS = [
    {
        id: "glass-cannon",
        name: "Glass Cannon",
        description: "High damage / low health",
        apply: (player) => {
            player.maxHealth = 3;
            player.health = Math.min(player.health, player.maxHealth);
            player.damageMultiplier = 2.5;
            player.speed = 220;
            player.projectileCount = 3;
        },
    },
    {
        id: "tank",
        name: "Tank",
        description: "High health / slow",
        apply: (player) => {
            player.maxHealth = 20;
            player.health = player.maxHealth;
            player.damageMultiplier = 0.8;
            player.speed = 120;
            player.projectileCount = 1;
        },
    },
    {
        id: "spray",
        name: "Sprayer",
        description: "Many projectiles, moderate stats",
        apply: (player) => {
            player.maxHealth = 8;
            player.health = player.maxHealth;
            player.damageMultiplier = 1.0;
            player.speed = 180;
            player.projectileCount = 6;
        },
    },
];

export function applyDevLoadout(simulation, loadoutIndex, playerId = "p1") {
    if (!simulation) return;
    const loadouts = DEV_LOADOUTS;
    const idx = Math.max(0, Math.min(loadoutIndex || 0, loadouts.length - 1));
    const loadout = loadouts[idx];
    if (!loadout) return;
    const player = simulation.getState().players.find((p) => p.id === playerId);
    if (!player) return;
    // Call the loadout's apply to mutate the player
    loadout.apply(player);
    console.log(`[DEV] Applied loadout: ${loadout.id} to ${playerId}`);
}

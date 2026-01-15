// Phase thresholds: phases trigger when health drops below these percentages
// phaseModifiers: [speedMult, fireRateMult, projectileSpeedMult] per phase
export const BOSSES = [
    {
        id: "sentinel",
        name: "Sentinel Core",
        healthMultiplier: 1.6,
        speedMultiplier: 1.1,
        patterns: ["beam-spin", "aimed-burst", "ring-with-gap"],
        phases: [1.0, 0.75, 0.5, 0.25],
        phaseModifiers: [
            { speed: 1.0, fireRate: 1.0, projectileSpeed: 1.0 },
            { speed: 1.25, fireRate: 1.35, projectileSpeed: 1.2 },
            { speed: 1.5, fireRate: 1.7, projectileSpeed: 1.4 },
            { speed: 1.8, fireRate: 2.0, projectileSpeed: 1.6 }
        ]
    },
    {
        id: "swarm-core",
        name: "Swarm Core",
        healthMultiplier: 1.5,
        speedMultiplier: 1.15,
        fireRateMultiplier: 1.1,
        patterns: ["summon-minions", "cone-volley", "pulse-ring"],
        phases: [1.0, 0.75, 0.5, 0.25],
        phaseModifiers: [
            { speed: 1.0, fireRate: 1.0, projectileSpeed: 1.0 },
            { speed: 1.2, fireRate: 1.4, projectileSpeed: 1.15 },
            { speed: 1.4, fireRate: 1.8, projectileSpeed: 1.25 },
            { speed: 1.6, fireRate: 2.2, projectileSpeed: 1.4 }
        ]
    },
    {
        id: "obelisk",
        name: "Obelisk",
        healthMultiplier: 1.7,
        speedMultiplier: 1.0,
        projectileSpeedMultiplier: 1.15,
        patterns: ["slam", "ricochet-shards", "lane-beams"],
        phases: [1.0, 0.75, 0.5, 0.25],
        phaseModifiers: [
            { speed: 1.0, fireRate: 1.0, projectileSpeed: 1.0 },
            { speed: 1.15, fireRate: 1.25, projectileSpeed: 1.25 },
            { speed: 1.3, fireRate: 1.5, projectileSpeed: 1.5 },
            { speed: 1.5, fireRate: 1.8, projectileSpeed: 1.8 }
        ]
    }
];

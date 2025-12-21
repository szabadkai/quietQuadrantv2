export const BOSSES = [
  {
    id: "sentinel",
    name: "Sentinel Core",
    healthMultiplier: 1.4,
    speedMultiplier: 1.1,
    patterns: ["beam-spin", "aimed-burst", "ring-with-gap"],
    phases: [1, 0.66, 0.33]
  },
  {
    id: "swarm-core",
    name: "Swarm Core",
    healthMultiplier: 1.3,
    speedMultiplier: 1.15,
    fireRateMultiplier: 1.1,
    patterns: ["summon-minions", "cone-volley", "pulse-ring"],
    phases: [1, 0.66, 0.33]
  },
  {
    id: "obelisk",
    name: "Obelisk",
    healthMultiplier: 1.5,
    speedMultiplier: 1.0,
    projectileSpeedMultiplier: 1.15,
    patterns: ["slam", "ricochet-shards", "lane-beams"],
    phases: [1, 0.66, 0.33]
  }
];

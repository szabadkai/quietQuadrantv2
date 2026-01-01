export const SYNERGIES = [
    {
        id: "black-hole-sun",
        name: "Black Hole Sun",
        requires: ["singularity-rounds", "chain-reaction"],
        description: "Chain implosions by pairing Singularity Rounds with Chain Reaction.",
        effects: { chainDamage: 0.25 }
    },
    {
        id: "railgun",
        name: "Railgun",
        requires: ["held-charge", "quantum-tunneling", "swift-projectiles"],
        description: "Charged shots pierce space when tunneling, swift, and fully charged.",
        effects: { critChance: 0.05, critDamage: 0.25 }
    },
    {
        id: "meat-grinder",
        name: "Meat Grinder",
        requires: ["neutron-core", "shrapnel"],
        description: "Kills grind foes into shrapnel clouds that keep on shredding.",
        effects: { critChance: 0.03, critDamage: 0.15 }
    },
    {
        id: "frame-rate-killer",
        name: "Frame Rate Killer",
        requires: ["bullet-hell", "rebound", "split-shot"],
        description: "Bullet Hell plus rebounds and splits flood the arena.",
        effects: { }
    },
    {
        id: "tesla-coil",
        name: "Tesla Coil",
        requires: ["chain-arc", "explosive-impact"],
        description: "Explosive impacts arc lightning between clustered targets.",
        effects: { arcDamage: 0.15 }
    },
    {
        id: "vampire",
        name: "Vampire",
        requires: ["blood-fuel", "berserk-module"],
        description: "Berserk feeding loop that sustains you with every strike.",
        effects: { critChance: 0.03 }
    },
    {
        id: "gravity-well",
        name: "Gravity Well",
        requires: ["singularity-rounds", "explosive-impact"],
        description: "Explosive singularities pull foes together for stacked damage.",
        effects: { explosionRadius: 0.3 }
    },
    {
        id: "phantom-striker",
        name: "Phantom Striker",
        requires: ["dash-sparks", "shrapnel"],
        description: "Dashes leave shrapnel-charged sparks that carve through packs.",
        effects: { dashCooldown: -0.25 }
    },
    {
        id: "sniper-elite",
        name: "Sniper Elite",
        requires: ["held-charge", "heatseeker"],
        description: "Heatseeking charged rounds drill targets with precision.",
        effects: { homingStrengthOnCharge: 2.0, critDamage: 0.1 }
    },
    {
        id: "glass-storm",
        name: "Glass Storm",
        requires: ["glass-cannon", "bullet-hell"],
        description: "Glass cannon barrages form a deadly, fragile storm.",
        effects: { accuracyPenaltyReduction: 0.5 }
    },
    {
        id: "prism-cannon",
        name: "Prism Cannon",
        requires: ["prism-spread", "heavy-barrel", "sidecar"],
        description: "Prismatic volleys converge into a focused heavy beam.",
        effects: { critChance: 0.08 }
    }
];

export const SYNERGY_BY_ID = Object.fromEntries(
    SYNERGIES.map((synergy) => [synergy.id, synergy])
);

export const SYNERGY_DEFINITIONS = SYNERGIES;

export const SYNERGIES = [
    {
        id: "black-hole-sun",
        name: "Black Hole Sun",
        requires: ["singularity-rounds", "chain-reaction"],
        description: "Chain implosions by pairing Singularity Rounds with Chain Reaction.",
        effects: { }
    },
    {
        id: "railgun",
        name: "Railgun",
        requires: ["held-charge", "quantum-tunneling", "swift-projectiles"],
        description: "Charged shots pierce space when tunneling, swift, and fully charged.",
        effects: { pierce: 99 }
    },
    {
        id: "meat-grinder",
        name: "Meat Grinder",
        requires: ["neutron-core", "shrapnel"],
        description: "Kills grind foes into shrapnel clouds that keep on shredding.",
        effects: { }
    },
    {
        id: "tesla-coil",
        name: "Tesla Coil",
        requires: ["chain-arc", "explosive-impact"],
        description: "Explosive impacts arc lightning between clustered targets.",
        effects: { }
    },
    {
        id: "vampire",
        name: "Vampire",
        requires: ["blood-fuel", "berserk-module"],
        description: "Berserk feeding loop that sustains you with every strike.",
        effects: { }
    },
    {
        id: "gravity-well",
        name: "Gravity Well",
        requires: ["singularity-rounds", "explosive-impact"],
        description: "Explosive singularities pull foes together for stacked damage.",
        effects: { }
    },
    {
        id: "phantom-striker",
        name: "Phantom Striker",
        requires: ["dash-sparks", "shrapnel"],
        description: "Dashes leave shrapnel-charged sparks that carve through packs.",
        effects: { }
    },
    {
        id: "sniper-elite",
        name: "Sniper Elite",
        requires: ["held-charge", "heatseeker"],
        description: "Heatseeking charged rounds drill targets with precision.",
        effects: { homingStrength: 0.2 }
    },
    {
        id: "glass-storm",
        name: "Glass Storm",
        requires: ["glass-cannon", "bullet-hell"],
        description: "Glass cannon barrages form a deadly, fragile storm.",
        effects: { accuracyPct: 0.5 }
    },
    {
        id: "prism-cannon",
        name: "Prism Cannon",
        requires: ["prism-spread", "heavy-barrel", "sidecar"],
        description: "Prismatic volleys converge into a focused heavy beam.",
        effects: { spreadDeg: -6 }
    }
];

export const SYNERGY_BY_ID = Object.fromEntries(
    SYNERGIES.map((synergy) => [synergy.id, synergy])
);

export const SYNERGY_DEFINITIONS = SYNERGIES;

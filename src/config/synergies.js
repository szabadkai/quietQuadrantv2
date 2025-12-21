export const SYNERGIES = [
  {
    id: "black-hole-sun",
    name: "Black Hole Sun",
    requires: ["singularity-rounds", "chain-reaction"],
    effects: { }
  },
  {
    id: "railgun",
    name: "Railgun",
    requires: ["held-charge", "quantum-tunneling", "swift-projectiles"],
    effects: { pierce: 99 }
  },
  {
    id: "meat-grinder",
    name: "Meat Grinder",
    requires: ["neutron-core", "shrapnel"],
    effects: { }
  },
  {
    id: "tesla-coil",
    name: "Tesla Coil",
    requires: ["chain-arc", "explosive-impact"],
    effects: { }
  },
  {
    id: "vampire",
    name: "Vampire",
    requires: ["blood-fuel", "berserk-module"],
    effects: { }
  },
  {
    id: "gravity-well",
    name: "Gravity Well",
    requires: ["singularity-rounds", "explosive-impact"],
    effects: { }
  },
  {
    id: "immortal-engine",
    name: "Immortal Engine",
    requires: ["shield-pickup", "kinetic-siphon"],
    effects: { }
  },
  {
    id: "phantom-striker",
    name: "Phantom Striker",
    requires: ["dash-sparks", "shrapnel"],
    effects: { }
  },
  {
    id: "sniper-elite",
    name: "Sniper Elite",
    requires: ["held-charge", "heatseeker"],
    effects: { homingStrength: 0.2 }
  },
  {
    id: "glass-storm",
    name: "Glass Storm",
    requires: ["glass-cannon", "bullet-hell"],
    effects: { accuracyPct: 0.5 }
  },
  {
    id: "prism-cannon",
    name: "Prism Cannon",
    requires: ["prism-spread", "heavy-barrel", "sidecar"],
    effects: { spreadDeg: -6 }
  }
];

export const SYNERGY_BY_ID = Object.fromEntries(
  SYNERGIES.map((synergy) => [synergy.id, synergy])
);

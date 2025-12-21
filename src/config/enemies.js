export const ELITE_MODIFIERS = {
  health: 1.7,
  speed: 1.25,
  damage: 1.2
};

export const ENEMIES = {
  drifter: {
    type: "drifter",
    name: "Drifter",
    health: 22,
    speed: 100,
    radius: 10,
    contactDamage: 1,
    xp: 10,
    eliteBehavior: "burst"
  },
  watcher: {
    type: "watcher",
    name: "Watcher",
    health: 35,
    speed: 65,
    radius: 10,
    contactDamage: 1,
    xp: 25,
    bulletDamage: 1,
    bulletSpeed: 145,
    fireCooldownTicks: 108,
    eliteBehavior: "rapid-fire"
  },
  mass: {
    type: "mass",
    name: "Mass",
    health: 85,
    speed: 40,
    radius: 11,
    contactDamage: 2,
    xp: 50,
    bulletDamage: 1,
    bulletSpeed: 110,
    fireCooldownTicks: 168,
    eliteBehavior: "burst-death"
  },
  phantom: {
    type: "phantom",
    name: "Phantom",
    health: 18,
    speed: 80,
    radius: 10,
    contactDamage: 1,
    xp: 20,
    eliteBehavior: "burst"
  },
  orbiter: {
    type: "orbiter",
    name: "Orbiter",
    health: 28,
    speed: 120,
    radius: 10,
    contactDamage: 1,
    xp: 30,
    bulletDamage: 1,
    bulletSpeed: 130,
    fireCooldownTicks: 132,
    eliteBehavior: "rapid-fire"
  },
  splitter: {
    type: "splitter",
    name: "Splitter",
    health: 50,
    speed: 55,
    radius: 11,
    contactDamage: 1,
    xp: 35,
    eliteBehavior: "death-explosion"
  }
};

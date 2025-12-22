const BASE_URL = import.meta.env?.BASE_URL ?? "./";
const withBase = (path) => `${BASE_URL}${path.replace(/^\//, "")}`;

export const SPRITE_ASSETS = [
  { key: "player", file: withBase("sprites/player.svg"), size: 64 },
  { key: "bullet", file: withBase("sprites/bullet.svg"), size: 64 },
  { key: "enemy-bullet", file: withBase("sprites/enemy-bullet.svg"), size: 64 },
  { key: "xp", file: withBase("sprites/xp.svg"), size: 64 },
  { key: "drifter", file: withBase("sprites/drifter.svg"), size: 64 },
  { key: "watcher", file: withBase("sprites/watcher.svg"), size: 64 },
  { key: "mass", file: withBase("sprites/mass.svg"), size: 64 },
  { key: "phantom", file: withBase("sprites/phantom.svg"), size: 64 },
  { key: "orbiter", file: withBase("sprites/orbiter.svg"), size: 64 },
  { key: "splitter", file: withBase("sprites/splitter.svg"), size: 64 },
  { key: "elite-drifter", file: withBase("sprites/elite-drifter.svg"), size: 64 },
  { key: "elite-watcher", file: withBase("sprites/elite-watcher.svg"), size: 64 },
  { key: "elite-mass", file: withBase("sprites/elite-mass.svg"), size: 64 },
  { key: "elite-phantom", file: withBase("sprites/elite-phantom.svg"), size: 64 },
  { key: "elite-orbiter", file: withBase("sprites/elite-orbiter.svg"), size: 64 },
  { key: "elite-splitter", file: withBase("sprites/elite-splitter.svg"), size: 64 },
  { key: "boss-sentinel", file: withBase("sprites/boss-sentinel.svg"), size: 64 },
  { key: "boss-swarm-core", file: withBase("sprites/boss-swarm-core.svg"), size: 64 },
  { key: "boss-obelisk", file: withBase("sprites/boss-obelisk.svg"), size: 64 },
  { key: "boss", file: withBase("sprites/boss.svg"), size: 64 }
];

export const ENEMY_SPRITES = {
  drifter: "drifter",
  watcher: "watcher",
  mass: "mass",
  phantom: "phantom",
  orbiter: "orbiter",
  splitter: "splitter"
};

export const ELITE_SPRITES = {
  drifter: "elite-drifter",
  watcher: "elite-watcher",
  mass: "elite-mass",
  phantom: "elite-phantom",
  orbiter: "elite-orbiter",
  splitter: "elite-splitter"
};

export const BOSS_SPRITES = {
  sentinel: "boss-sentinel",
  "swarm-core": "boss-swarm-core",
  obelisk: "boss-obelisk"
};

export const SPRITE_KEYS = {
  player: "player",
  bullet: "bullet",
  enemyBullet: "enemy-bullet",
  xp: "xp",
  bossFallback: "boss"
};

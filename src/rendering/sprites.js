import { resolveAssetPath } from "../utils/assets.js";

export const SPRITE_ASSETS = [
  { key: "player", file: resolveAssetPath("sprites/player.svg"), size: 64 },
  { key: "bullet", file: resolveAssetPath("sprites/bullet.svg"), size: 64 },
  { key: "enemy-bullet", file: resolveAssetPath("sprites/enemy-bullet.svg"), size: 64 },
  { key: "xp", file: resolveAssetPath("sprites/xp.svg"), size: 64 },
  { key: "drifter", file: resolveAssetPath("sprites/drifter.svg"), size: 64 },
  { key: "watcher", file: resolveAssetPath("sprites/watcher.svg"), size: 64 },
  { key: "mass", file: resolveAssetPath("sprites/mass.svg"), size: 64 },
  { key: "phantom", file: resolveAssetPath("sprites/phantom.svg"), size: 64 },
  { key: "orbiter", file: resolveAssetPath("sprites/orbiter.svg"), size: 64 },
  { key: "splitter", file: resolveAssetPath("sprites/splitter.svg"), size: 64 },
  { key: "elite-drifter", file: resolveAssetPath("sprites/elite-drifter.svg"), size: 64 },
  { key: "elite-watcher", file: resolveAssetPath("sprites/elite-watcher.svg"), size: 64 },
  { key: "elite-mass", file: resolveAssetPath("sprites/elite-mass.svg"), size: 64 },
  { key: "elite-phantom", file: resolveAssetPath("sprites/elite-phantom.svg"), size: 64 },
  { key: "elite-orbiter", file: resolveAssetPath("sprites/elite-orbiter.svg"), size: 64 },
  { key: "elite-splitter", file: resolveAssetPath("sprites/elite-splitter.svg"), size: 64 },
  { key: "boss-sentinel", file: resolveAssetPath("sprites/boss-sentinel.svg"), size: 64 },
  { key: "boss-swarm-core", file: resolveAssetPath("sprites/boss-swarm-core.svg"), size: 64 },
  { key: "boss-obelisk", file: resolveAssetPath("sprites/boss-obelisk.svg"), size: 64 },
  { key: "boss", file: resolveAssetPath("sprites/boss.svg"), size: 64 }
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

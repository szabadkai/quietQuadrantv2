export const TICK_RATE = 60;
export const ARENA_WIDTH = 1280;
export const ARENA_HEIGHT = 800;

export const PLAYER_RADIUS = 12;
export const BULLET_RADIUS = 3;
export const ENEMY_BULLET_RADIUS = 4;
export const PICKUP_RADIUS = 6;
export const PLAYER_INVULN_FRAMES = 30;

// Weapon heat system - prevents projectile spam
export const MAX_PLAYER_BULLETS = 70;
export const HEAT_WARNING_THRESHOLD = 0.6; // 60% = warning starts
export const OVERHEAT_COOLDOWN_TICKS = 180; // 3 seconds at 60 TPS
export const HEAT_WARNING_MIN_DISPLAY_MS = 3000; // Minimum time warning stays visible
export const HEAT_COOLDOWN_RATE = 0.008; // Heat drops by this amount per tick when not firing

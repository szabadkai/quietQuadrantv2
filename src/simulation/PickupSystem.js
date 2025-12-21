import { TICK_RATE } from "../utils/constants.js";
import { normalize, lerp } from "../utils/math.js";

const DEFAULT_MAGNET_RADIUS = 80;
const MAGNET_MAX_SPEED = 520;
const MAGNET_STEER = 0.35;

export const PickupSystem = {
  update(state) {
    const players = state.players.filter((player) => player.alive);
    if (!players.length) return;

    for (const pickup of state.pickups) {
      if (!pickup.alive) continue;
      if (pickup.type !== "xp") continue;

      pickup.prevX = pickup.x;
      pickup.prevY = pickup.y;

      const target = resolvePickupTarget(pickup, players);
      if (!target) {
        pickup.vx = 0;
        pickup.vy = 0;
        continue;
      }

      const dir = normalize(target.x - pickup.x, target.y - pickup.y);
      const desiredVx = dir.x * MAGNET_MAX_SPEED;
      const desiredVy = dir.y * MAGNET_MAX_SPEED;
      pickup.vx = lerp(pickup.vx ?? 0, desiredVx, MAGNET_STEER);
      pickup.vy = lerp(pickup.vy ?? 0, desiredVy, MAGNET_STEER);

      pickup.x += pickup.vx / TICK_RATE;
      pickup.y += pickup.vy / TICK_RATE;
    }
  }
};

function resolvePickupTarget(pickup, players) {
  if (pickup.magnetized && pickup.targetId) {
    const target = players.find((player) => player.id === pickup.targetId);
    if (target) return target;
    pickup.magnetized = false;
    pickup.targetId = null;
  }

  let best = null;
  let bestDist = Infinity;
  for (const player of players) {
    const baseRadius = player.magnetRadius ?? DEFAULT_MAGNET_RADIUS;
    const radius = baseRadius * (1 + (player.xpPickupRadiusPct ?? 0));
    const dx = player.x - pickup.x;
    const dy = player.y - pickup.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > radius * radius) continue;
    if (distSq < bestDist) {
      bestDist = distSq;
      best = player;
    }
  }

  if (best) {
    pickup.magnetized = true;
    pickup.targetId = best.id;
  }

  return best;
}

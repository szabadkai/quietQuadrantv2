export class StateSync {
  constructor() {
    this.correctionThreshold = 50;
    this.smoothThreshold = 5;
  }

  generateSnapshot(state) {
    return {
      tick: state.tick,
      players: state.players.map((player) => ({
        id: player.id,
        x: Math.round(player.x),
        y: Math.round(player.y),
        health: player.health
      })),
      enemies: state.enemies.slice(0, 20).map((enemy) => ({
        id: enemy.id,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y)
      }))
    };
  }

  applyCorrection(state, snapshot) {
    if (!snapshot) return;
    if (snapshot.players) {
      for (const correction of snapshot.players) {
        const player = state.players.find((p) => p.id === correction.id);
        if (!player) continue;
        this.applyEntityCorrection(player, correction);
        if (typeof correction.health === "number") {
          player.health = correction.health;
        }
      }
    }

    if (snapshot.enemies) {
      for (const correction of snapshot.enemies) {
        const enemy = state.enemies.find((e) => e.id === correction.id);
        if (!enemy) continue;
        this.applyEntityCorrection(enemy, correction);
      }
    }
  }

  applyEntityCorrection(entity, correction) {
    const dx = correction.x - entity.x;
    const dy = correction.y - entity.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.correctionThreshold) {
      entity.x = correction.x;
      entity.y = correction.y;
      return;
    }

    if (dist > this.smoothThreshold) {
      entity.x += dx * 0.3;
      entity.y += dy * 0.3;
    }
  }
}

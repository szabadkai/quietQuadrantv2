export const GameEndSystem = {
  update(state) {
    if (state.phase === "ended") return;

    const alivePlayers = state.players.some((player) => player.alive);
    if (!alivePlayers) {
      state.phase = "ended";
      state.events.push({ type: "defeat" });
      this.finalizeRun(state, false);
      return;
    }

    if (state.phase === "boss" && !state.boss) {
      state.phase = "ended";
      state.events.push({ type: "victory" });
      this.finalizeRun(state, true);
    }
  },

  finalizeRun(state, victory) {
    if (state.runSummary) return;
    const stats = state.runStats;
    const duration = stats.ticks / 60;
    const accuracy =
      stats.shotsFired > 0 ? stats.shotsHit / stats.shotsFired : 0;
    const leadPlayer = state.players[0];
    stats.endHealth = leadPlayer?.health ?? 0;
    stats.maxHealth = leadPlayer?.maxHealth ?? stats.maxHealth;
    state.runSummary = {
      victory,
      duration,
      wave: state.wave.current,
      kills: stats.kills,
      bossDefeated: stats.bossDefeated,
      damageDealt: stats.damageDealt,
      damageTaken: stats.damageTaken,
      accuracy,
      multiplayer: stats.multiplayer,
      shotsFired: stats.shotsFired,
      shotsHit: stats.shotsHit,
      highestHit: stats.highestHit,
      maxMultiKill: stats.maxMultiKill,
      endHealth: stats.endHealth,
      maxHealth: stats.maxHealth,
      maxProjectiles: stats.maxProjectiles,
      maxMoveSpeed: stats.maxMoveSpeed,
      totalHealing: stats.totalHealing,
      teamDamageShare: stats.teamDamageShare,
      partnerRevives: stats.partnerRevives,
      syncedUpgradePicks: stats.syncedUpgradePicks,
      synergies: stats.synergies ?? []
    };
  }
};

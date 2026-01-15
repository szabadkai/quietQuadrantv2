export const GameEndSystem = {
    update(state) {
        if (state.phase === "ended") return;
        const waitingForBossAnimation = (state.bossDeathTimer ?? 0) > 0;

        const alivePlayers = state.players.some((player) => player.alive);
        if (!alivePlayers) {
            state.phase = "ended";
            const leadPlayer = state.players[0];
            state.events.push({
                type: "defeat",
                x: leadPlayer?.x,
                y: leadPlayer?.y
            });
            this.finalizeRun(state, false);
            return;
        }

        if (state.phase === "boss" && !state.boss) {
            if (waitingForBossAnimation) return;
            if (
                state.pendingUpgrade ||
        state.players.some(
            (player) => player.alive && (player.pendingUpgrades ?? 0) > 0
        )
            ) {
                return;
            }
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
            completedAt: Date.now(),
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
            synergies: stats.synergies ?? [],
            upgradesPicked: stats.upgradesPicked ?? 0,
            affixId: stats.affixId ?? state.affix?.id ?? null,
            affixName: state.affix?.name ?? null,
            bossId: stats.bossId ?? state.boss?.id ?? null,
            bossName: stats.bossName ?? state.boss?.name ?? null,
            wavesCleared: stats.wave ?? 0,
            weeklySeed: state.seed ?? null
        };
    }
};

import { useEffect, useRef } from "react";
import { transmissionManager } from "../../audio/TransmissionManager.js";
import { WAVES } from "../../config/waves.js";
import { UPGRADE_BY_ID } from "../../config/upgrades.js";
import { SYNERGY_BY_ID } from "../../config/synergies.js";
import { useMetaStore } from "../../state/useMetaStore.js";

export function useGameTransmissions(state, session, setWaveAnnouncement) {
    const lastAnnouncedWaveRef = useRef(null);
    const lastHealthTierRef = useRef("healthy");

    const phase = state?.phase;
    const currentWave = state?.wave?.current;
    const tick = state?.tick;
    const events = state?.events;
    const pendingUpgrade = state?.pendingUpgrade;
    const players = state?.players;

    // Reset on mount
    useEffect(() => {
        transmissionManager.reset();
        return () => transmissionManager.reset();
    }, []);

    // Wave announcements via events
    useEffect(() => {
        const handleIntermission = (e) => {
            const nextWave = e.detail.nextWave;
            if (phase !== "intermission") return;
            if (currentWave !== nextWave) return;
            if (lastAnnouncedWaveRef.current === nextWave) return;
            lastAnnouncedWaveRef.current = nextWave;

            // Show wave announcement (wave display is 1-indexed)
            setWaveAnnouncement(nextWave + 1);

            const waveConfig = WAVES[nextWave];
            const upcomingTypes = waveConfig?.enemies?.map((enemy) => enemy.kind) ?? [];
            const hasElite = waveConfig?.enemies?.some((enemy) => enemy.elite) ?? false;

            transmissionManager.playWaveBriefing(upcomingTypes, hasElite);
        };

        window.addEventListener("qq-wave-intermission", handleIntermission);
        return () => window.removeEventListener("qq-wave-intermission", handleIntermission);
    }, [phase, currentWave, setWaveAnnouncement]);

    // Reset lastAnnouncedWaveRef on pregame
    useEffect(() => {
        if (phase === "pregame") {
            lastAnnouncedWaveRef.current = null;
        }
    }, [phase]);

    // Game events (bosses, victory, etc)
    useEffect(() => {
        if (!events?.length) return;
        const metaActions = useMetaStore.getState().actions;

        for (const event of events) {
            if (event.type === "boss-spawn") {
                transmissionManager.playBossIntro(event.bossId);
            } else if (event.type === "victory") {
                transmissionManager.playVictory();
            } else if (event.type === "defeat") {
                transmissionManager.playDefeat();
            } else if (event.type === "wave-cleared") {
                transmissionManager.playWaveClear();
            } else if (event.type === "synergy-unlocked") {
                const synergy = SYNERGY_BY_ID[event.synergyId];
                if (synergy) {
                    transmissionManager.playSynergyUnlocked();
                    metaActions.showAchievement(
                        synergy.id,
                        synergy.name,
                        synergy.description ?? ""
                    );
                }
            }
        }

        // Occasionally play a random transmission
        if (tick % 1800 === 0) {
            transmissionManager.playRandom(phase);
        }
    }, [tick, events, phase]);

    // Upgrade intel
    useEffect(() => {
        if (!pendingUpgrade) return;

        const upgrades = pendingUpgrade.options
            ?.map((id) => UPGRADE_BY_ID[id])
            .filter(Boolean) ?? [];

        const hasLegendary = upgrades.some((upgrade) => upgrade.rarity === "legendary");
        const rarity = hasLegendary
            ? "legendary"
            : upgrades.find((upgrade) => upgrade.rarity === "rare")?.rarity;

        const categories = upgrades
            .map((upgrade) => upgrade.category)
            .filter(Boolean);

        transmissionManager.playUpgradeIntel({
            rarity,
            categories,
            options: pendingUpgrade.options ?? []
        });
    }, [pendingUpgrade]);

    // Health warnings
    useEffect(() => {
        if (!players?.length) return;

        const localId = session?.localPlayerId;
        const local = players.find((player) => player.id === localId) ?? players[0];
        if (!local) return;

        const ratio = local.maxHealth > 0 ? local.health / local.maxHealth : 1;
        const tier = ratio <= 0.2 ? "critical" : ratio <= 0.45 ? "warning" : "healthy";

        if (tier === "healthy") {
            if (ratio >= 0.65) {
                lastHealthTierRef.current = "healthy";
            }
            return;
        }

        if (lastHealthTierRef.current !== tier) {
            lastHealthTierRef.current = tier;
            transmissionManager.playHealthWarning(tier);
        }
    }, [tick, players, session?.localPlayerId]);
}

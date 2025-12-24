import React, { useEffect } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { musicManager } from "../../audio/MusicManager.js";
import { Button } from "../components/Button.jsx";
import { CardRewardModal } from "../components/CardRewardModal.jsx";
import { UPGRADES } from "../../config/upgrades.js";

const MAX_CARD_BOOST = 5;

function rollCardRewardOptions(cardCollection, count = 3) {
  const unlocked = new Set(cardCollection.unlockedUpgrades ?? []);
  const boosts = cardCollection.upgradeBoosts ?? {};
  let pool = Object.values(UPGRADES).filter((upgrade) => {
    const boostLevel = boosts[upgrade.id] ?? 0;
    return !unlocked.has(upgrade.id) || boostLevel < MAX_CARD_BOOST;
  });

  if (pool.length < count) {
    pool = Object.values(UPGRADES);
  }

  const options = [];
  const pickCount = Math.min(count, pool.length);
  const available = [...pool];
  for (let i = 0; i < pickCount; i += 1) {
    const index = Math.floor(Math.random() * available.length);
    const [picked] = available.splice(index, 1);
    if (picked) options.push(picked.id);
  }
  return options;
}

export function SummaryScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const startGame = useGameStore((s) => s.actions.startGame);
  const lastRun = useMetaStore((s) => s.lastRun);
  const stats = useMetaStore((s) => s.stats);
  const cardCollection = useMetaStore((s) => s.cardCollection);
  const pendingCardReward = useMetaStore((s) => s.pendingCardReward);
  const lastRewardRunId = useMetaStore((s) => s.lastRewardRunId);
  const metaActions = useMetaStore((s) => s.actions);

  useEffect(() => {
    musicManager.init();
    musicManager.play("level1");
  }, []);

  useEffect(() => {
    if (!lastRun?.victory) return;
    const runId = lastRun.completedAt;
    if (!runId) return;
    if (pendingCardReward.active && pendingCardReward.runId === runId) return;
    if (lastRewardRunId === runId) return;
    const options = rollCardRewardOptions(cardCollection, 3);
    metaActions.setCardReward(options, runId);
  }, [
    lastRun,
    pendingCardReward.active,
    pendingCardReward.runId,
    lastRewardRunId,
    cardCollection,
    metaActions,
  ]);

  const handlePlayAgain = () => {
    startGame({ seed: Date.now() });
    setScreen("game");
  };

  if (!lastRun) {
    return (
      <div className="qq-screen">
        <div className="qq-panel">
          <p>No run data available.</p>
          <Button onClick={() => setScreen("title")}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isNewBest = lastRun.wave > (stats.bestWave - 1);

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-narrow">
        <div className="qq-summary-header">
          <span className={`qq-result ${lastRun.victory ? "victory" : "defeat"}`}>
            {lastRun.victory ? "VICTORY" : "DEFEAT"}
          </span>
          <p className="qq-muted">
            {lastRun.victory
              ? "You survived the quadrant!"
              : "The void claims another ship..."}
          </p>
        </div>

        <div className="qq-summary-stats">
          <div className="qq-summary-row">
            <span>Time</span>
            <span>{formatTime(lastRun.duration)}</span>
          </div>
          <div className="qq-summary-row">
            <span>Wave</span>
            <span>
              {lastRun.wave + 1}
              {isNewBest && <span className="qq-new-best">NEW BEST!</span>}
            </span>
          </div>
          <div className="qq-summary-row">
            <span>Enemies</span>
            <span>{lastRun.kills}</span>
          </div>
          <div className="qq-summary-row">
            <span>Damage Dealt</span>
            <span>{Math.round(lastRun.damageDealt)}</span>
          </div>
          <div className="qq-summary-row">
            <span>Damage Taken</span>
            <span>{Math.round(lastRun.damageTaken)}</span>
          </div>
          <div className="qq-summary-row">
            <span>Accuracy</span>
            <span>{Math.round(lastRun.accuracy * 100)}%</span>
          </div>
        </div>

        {lastRun.synergies?.length > 0 && (
          <div className="qq-summary-section">
            <span className="qq-label">SYNERGIES DISCOVERED</span>
            <div className="qq-synergy-list">
              {lastRun.synergies.map((s) => (
                <span key={s} className="qq-synergy-tag">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="qq-summary-actions">
          <Button primary onClick={handlePlayAgain}>
            Run Again
          </Button>
          <Button onClick={() => setScreen("title")}>
            Back to Menu
          </Button>
        </div>
      </div>

      {lastRun.victory && pendingCardReward.active && (
        <CardRewardModal
          options={pendingCardReward.options}
          onSelect={metaActions.claimCardReward}
        />
      )}
    </div>
  );
}

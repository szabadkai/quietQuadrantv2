import React from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { Button } from "../components/Button.jsx";

export function HowToPlayScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-wide">
        <div className="qq-screen-header">
          <span className="qq-label">HOW TO PLAY</span>
          <h1>Survive the Quadrant</h1>
        </div>

        <div className="qq-howto-grid">
          <section className="qq-howto-section">
            <h2>Controls</h2>
            <div className="qq-control-list">
              <div className="qq-control-row">
                <span className="qq-key">WASD</span>
                <span>Move ship</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">Mouse</span>
                <span>Aim</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">Click</span>
                <span>Fire</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">Shift</span>
                <span>Dash (invulnerable)</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">Esc</span>
                <span>Pause</span>
              </div>
            </div>
          </section>

          <section className="qq-howto-section">
            <h2>Gameplay</h2>
            <ul className="qq-howto-list">
              <li>Survive 10 waves of enemies</li>
              <li>Defeat the boss on wave 11</li>
              <li>Collect XP orbs to level up</li>
              <li>Choose upgrades to build your ship</li>
              <li>Combine upgrades for synergies</li>
            </ul>
          </section>

          <section className="qq-howto-section">
            <h2>Enemies</h2>
            <div className="qq-enemy-list">
              <div className="qq-enemy-row">
                <span className="qq-enemy-icon">●</span>
                <span>Drifter - Chases you</span>
              </div>
              <div className="qq-enemy-row">
                <span className="qq-enemy-icon">◆</span>
                <span>Watcher - Shoots at you</span>
              </div>
              <div className="qq-enemy-row">
                <span className="qq-enemy-icon">⬡</span>
                <span>Mass - Slow, burst attacks</span>
              </div>
              <div className="qq-enemy-row">
                <span className="qq-enemy-icon">◇</span>
                <span>Phantom - Teleports</span>
              </div>
              <div className="qq-enemy-row">
                <span className="qq-enemy-icon">○</span>
                <span>Orbiter - Circles and shoots</span>
              </div>
              <div className="qq-enemy-row">
                <span className="qq-enemy-icon">⊕</span>
                <span>Splitter - Splits on death</span>
              </div>
            </div>
          </section>

          <section className="qq-howto-section">
            <h2>Tips</h2>
            <ul className="qq-howto-list">
              <li>Keep moving to avoid bullets</li>
              <li>Save dash for emergencies</li>
              <li>Prioritize dangerous enemies</li>
              <li>Look for upgrade synergies</li>
              <li>Learn boss attack patterns</li>
            </ul>
          </section>
        </div>

        <div className="qq-screen-actions">
          <Button primary onClick={() => setScreen("title")}>
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}

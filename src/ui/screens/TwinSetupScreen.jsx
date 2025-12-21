import React from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { Button } from "../components/Button.jsx";

export function TwinSetupScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const startGame = useGameStore((s) => s.actions.startGame);

  const handleStart = () => {
    startGame({
      seed: Date.now(),
      multiplayer: { mode: "twin" }
    });
    setScreen("game");
  };

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-narrow">
        <div className="qq-screen-header">
          <span className="qq-label">LOCAL CO-OP</span>
          <h1>Twin Mode</h1>
          <p className="qq-muted">Two players, one keyboard</p>
        </div>

        <div className="qq-twin-controls">
          <div className="qq-twin-player">
            <h3>Player 1</h3>
            <div className="qq-control-list">
              <div className="qq-control-row">
                <span className="qq-key">WASD</span>
                <span>Move</span>
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
                <span className="qq-key">L-Shift</span>
                <span>Dash</span>
              </div>
            </div>
          </div>

          <div className="qq-twin-player">
            <h3>Player 2</h3>
            <div className="qq-control-list">
              <div className="qq-control-row">
                <span className="qq-key">Arrows</span>
                <span>Move</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">IJKL</span>
                <span>Aim</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">Enter</span>
                <span>Fire</span>
              </div>
              <div className="qq-control-row">
                <span className="qq-key">R-Shift</span>
                <span>Dash</span>
              </div>
            </div>
          </div>
        </div>

        <div className="qq-screen-actions">
          <Button primary onClick={handleStart}>
            Start Game
          </Button>
          <Button onClick={() => setScreen("multiplayer")}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { Button } from "../components/Button.jsx";

export function TwinSetupScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const startGame = useGameStore((s) => s.actions.startGame);
  const [p2Input, setP2Input] = useState("keyboard");
  const [selectedPad, setSelectedPad] = useState(null);
  const [gamepads, setGamepads] = useState([]);

  useEffect(() => {
    let rafId;
    const tick = () => {
      if (typeof navigator !== "undefined" && navigator.getGamepads) {
        const pads = Array.from(navigator.getGamepads() ?? []).filter(Boolean);
        setGamepads(
          pads.map((pad) => ({
            id: pad.id,
            index: pad.index
          }))
        );
        if (pads.length > 0 && selectedPad === null) {
          setSelectedPad(pads[0].index);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selectedPad]);

  const hasGamepad = useMemo(() => gamepads.length > 0, [gamepads]);

  const handleStart = () => {
    const p2GamepadIndex = p2Input === "gamepad" ? selectedPad ?? 0 : null;
    startGame({
      seed: Date.now(),
      multiplayer: {
        mode: "twin",
        twinOptions: {
          p1GamepadIndex: null,
          p2Input,
          p2GamepadIndex
        }
      }
    });
    setScreen("game");
  };

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-narrow">
        <div className="qq-screen-header">
          <span className="qq-label">LOCAL CO-OP</span>
          <h1>Twin Mode</h1>
          <p className="qq-muted">Player 1 on keyboard + mouse. Choose Player 2 input.</p>
        </div>

        <div className="qq-toggle-row" style={{ marginBottom: 16 }}>
          <span>Player 2 Input</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => setP2Input("keyboard")}
              primary={p2Input === "keyboard"}
              data-nav-item
            >
              Keyboard
            </Button>
            <Button
              onClick={() => setP2Input("gamepad")}
              primary={p2Input === "gamepad"}
              data-nav-item
            >
              Controller {hasGamepad ? "" : "(not detected)"}
            </Button>
          </div>
        </div>

        {p2Input === "gamepad" && (
          <div className="qq-control-list" style={{ marginBottom: 16 }}>
            <div className="qq-control-row">
              <span className="qq-key">Connected pads</span>
              <span>
                {hasGamepad
                  ? gamepads
                      .map((pad) => `#${pad.index + 1}: ${pad.id}`)
                      .join(" • ")
                  : "None"}
              </span>
            </div>
            <div className="qq-control-row">
              <span className="qq-key">Selected</span>
              <span>{selectedPad !== null ? `Pad #${(selectedPad ?? 0) + 1}` : "Auto"}</span>
            </div>
          </div>
        )}

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
            {p2Input === "keyboard" ? (
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
            ) : (
              <div className="qq-control-list">
                <div className="qq-control-row">
                  <span className="qq-key">Left Stick</span>
                  <span>Move</span>
                </div>
                <div className="qq-control-row">
                  <span className="qq-key">Right Stick</span>
                  <span>Aim / Fire</span>
                </div>
                <div className="qq-control-row">
                  <span className="qq-key">RT / RB / A</span>
                  <span>Fire</span>
                </div>
                <div className="qq-control-row">
                  <span className="qq-key">LT / LB / B</span>
                  <span>Dash</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="qq-screen-actions">
          <Button
            primary
            onClick={handleStart}
            disabled={p2Input === "gamepad" && !hasGamepad}
          >
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

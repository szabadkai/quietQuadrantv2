import React, { useState, useRef, useEffect } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { NetworkManager } from "../../network/NetworkManager.js";
import { Button } from "../components/Button.jsx";

export function JoinGameScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const startGame = useGameStore((s) => s.actions.startGame);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const managerRef = useRef(null);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  const handleJoin = () => {
    if (code.length !== 6) {
      setError("Enter a 6-character code");
      return;
    }

    setStatus("connecting");
    setError("");

    const manager = new NetworkManager();
    const normalizedCode = manager.joinRoom(code);

    if (!normalizedCode) {
      setError("Invalid room code");
      setStatus("idle");
      return;
    }

    managerRef.current = manager;

    manager.on("peerJoin", () => {
      setStatus("connected");
    });

    manager.on("start", (payload) => {
      if (!payload?.seed) return;
      startGame({
        seed: payload.seed,
        multiplayer: {
          mode: "online",
          role: "guest",
          localPlayerId: "p2",
          network: manager
        }
      });
      setScreen("game");
    });

    manager.on("error", (err) => {
      setError(err?.message || "Connection failed");
      setStatus("idle");
    });
  };

  const handleCancel = () => {
    if (managerRef.current) {
      managerRef.current.leave();
      managerRef.current = null;
    }
    setScreen("multiplayer");
  };

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.leave();
      }
    };
  }, []);

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-narrow">
        <div className="qq-screen-header">
          <span className="qq-label">JOIN GAME</span>
          <h1>Enter Room Code</h1>
        </div>

        <div className="qq-code-input-group">
          <input
            type="text"
            className="qq-code-input"
            value={code}
            onChange={handleCodeChange}
            placeholder="ABC123"
            maxLength={6}
            disabled={status !== "idle"}
          />
          {error && <div className="qq-error">{error}</div>}
        </div>

        <div className="qq-connection-status">
          <span className={`qq-status-dot ${status === "connected" ? "connected" : status === "connecting" ? "connecting" : ""}`} />
          <span>
            {status === "connected" && "Connected! Waiting for host..."}
            {status === "connecting" && "Connecting..."}
            {status === "idle" && "Enter code to join"}
          </span>
        </div>

        <div className="qq-screen-actions">
          <Button
            primary
            onClick={handleJoin}
            disabled={code.length !== 6 || status !== "idle"}
          >
            Join Game
          </Button>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState } from "react";
import { useGameStore } from "../../state/useGameStore.js";
import { useUIStore } from "../../state/useUIStore.js";
import { NetworkManager } from "../../network/NetworkManager.js";
import { RoomCodeDisplay } from "./RoomCodeDisplay.jsx";
import { RoomCodeInput } from "./RoomCodeInput.jsx";

export function MultiplayerLobby() {
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const startGame = useGameStore((s) => s.actions.startGame);
    const [mode, setMode] = useState(null);
    const [roomCode, setRoomCode] = useState("");
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const managerRef = useRef(null);
    const modeRef = useRef(null);
    const listenersAttached = useRef(false);

    const attachListeners = (manager) => {
        if (listenersAttached.current) return;
        listenersAttached.current = true;

        manager.on("peerJoin", () => {
            setConnected(true);
        });

        manager.on("peerLeave", () => {
            setConnected(false);
        });

        manager.on("start", (payload) => {
            if (!payload?.seed) return;
            if (modeRef.current !== "join") return;
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
            setError(err?.message ?? "Connection error.");
        });
    };

    const ensureManager = () => {
        if (!managerRef.current) {
            managerRef.current = new NetworkManager();
        }
        return managerRef.current;
    };

    const handleHost = () => {
        setError("");
        const manager = ensureManager();
        const code = manager.hostRoom();
        attachListeners(manager);
        setRoomCode(code);
        modeRef.current = "host";
        setMode("host");
    };

    const handleJoin = () => {
        setError("");
        const manager = ensureManager();
        const code = manager.joinRoom(roomCode);
        if (!code) {
            setError("Enter a valid room code.");
            return;
        }
        attachListeners(manager);
        setRoomCode(code);
        modeRef.current = "join";
        setMode("join");
    };

    const handleStart = () => {
        const manager = managerRef.current;
        if (!manager) return;
        const seed = Date.now();
        manager.sendStart({ seed });
        startGame({
            seed,
            multiplayer: {
                mode: "online",
                role: "host",
                localPlayerId: "p1",
                network: manager
            }
        });
        setScreen("game");
    };

    const handleLocal = () => {
        startGame({
            seed: Date.now(),
            multiplayer: { mode: "twin" }
        });
        setScreen("game");
    };

    const handleBack = () => {
        if (managerRef.current) {
            managerRef.current.leave();
            managerRef.current = null;
            listenersAttached.current = false;
        }
        modeRef.current = null;
        setScreen("title");
    };

    const statusText = (() => {
        if (error) return error;
        if (mode === "host") {
            return connected ? "Peer connected. Start when ready." : "Waiting for peer...";
        }
        if (mode === "join") {
            return connected ? "Connected. Waiting for host..." : "Connecting...";
        }
        return "Host a room or join with a code.";
    })();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "22px", letterSpacing: "0.24em" }}>MULTIPLAYER</div>
            <div style={{ fontSize: "12px", color: "var(--qq-muted)" }}>{statusText}</div>

            <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
                <button type="button" className="qq-button primary" onClick={handleHost}>
          Host Room
                </button>
                <button type="button" className="qq-button" onClick={handleLocal}>
          Local Co-op
                </button>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
                <RoomCodeInput value={roomCode} onChange={setRoomCode} />
                <button type="button" className="qq-button" onClick={handleJoin}>
          Join Room
                </button>
            </div>

            <RoomCodeDisplay code={mode === "host" ? roomCode : ""} />

            {mode === "host" ? (
                <button
                    type="button"
                    className="qq-button primary"
                    onClick={handleStart}
                    disabled={!connected}
                    style={{ opacity: connected ? 1 : 0.6 }}
                >
          Start Game
                </button>
            ) : null}

            <button type="button" className="qq-button" onClick={handleBack}>
        Back
            </button>
        </div>
    );
}

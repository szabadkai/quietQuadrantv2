import React, { useState, useRef, useEffect } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { NetworkManager } from "../../network/NetworkManager.js";
import { Button } from "../components/Button.jsx";

export function HostGameScreen() {
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const startGame = useGameStore((s) => s.actions.startGame);
    const [roomCode, setRoomCode] = useState("");
    const [connected, setConnected] = useState(false);
    const [copied, setCopied] = useState(false);
    const managerRef = useRef(null);

    useEffect(() => {
        const manager = new NetworkManager();
        const code = manager.hostRoom();
        setRoomCode(code);
        managerRef.current = manager;

        manager.on("peerJoin", () => setConnected(true));
        manager.on("peerLeave", () => setConnected(false));

        return () => {
            manager.leave();
        };
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.warn("Copy failed:", e);
        }
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

    const handleCancel = () => {
        if (managerRef.current) {
            managerRef.current.leave();
            managerRef.current = null;
        }
        setScreen("multiplayer");
    };

    return (
        <div className="qq-screen">
            <div className="qq-panel qq-panel-narrow">
                <div className="qq-screen-header">
                    <span className="qq-label">HOST GAME</span>
                    <h1>Waiting for Player</h1>
                </div>

                <div className="qq-room-code-display">
                    <span className="qq-label">Room Code</span>
                    <div className="qq-room-code">{roomCode}</div>
                    <Button onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy Code"}
                    </Button>
                </div>

                <div className="qq-connection-status">
                    <span className={`qq-status-dot ${connected ? "connected" : ""}`} />
                    <span>{connected ? "Player connected!" : "Waiting for player..."}</span>
                </div>

                <div className="qq-screen-actions">
                    <Button
                        primary
                        onClick={handleStart}
                        disabled={!connected}
                    >
            Start Game
                    </Button>
                    <Button onClick={handleCancel}>
            Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

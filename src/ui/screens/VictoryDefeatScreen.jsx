import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../state/useGameStore.js";
import { useUIStore } from "../../state/useUIStore.js";
import victoryVideo from "../../../assets/victory.mp4";
import defeatVideo from "../../../assets/defeat.mp4";
import { isSlowConnection, preloadVideo } from "../../utils/networkUtils.js";

export function VictoryDefeatScreen() {
    const runSummary = useGameStore((s) => s.lastRun);
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const videoRef = useRef(null);

    const [allowSkip, setAllowSkip] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [videoReady, setVideoReady] = useState(false);

    const handleComplete = React.useCallback(() => {
        setScreen("summary");
    }, [setScreen]);

    useEffect(() => {
        if (!runSummary) {
            handleComplete();
            return;
        }

        // Skip videos on slow connections
        if (isSlowConnection()) {
            console.log("[VictoryDefeatScreen] Slow connection detected, skipping video");
            handleComplete();
            return;
        }

        // Preload the appropriate video
        const videoSrc = runSummary.victory ? victoryVideo : defeatVideo;
        preloadVideo(videoSrc)
            .then(() => {
                console.log("[VictoryDefeatScreen] Video preloaded");
                setVideoReady(true);
            })
            .catch((error) => {
                console.warn("[VictoryDefeatScreen] Video preload failed:", error);
                setVideoReady(true); // Continue anyway
            });
    }, [runSummary, handleComplete]);

    // Grace period to prevent accidental skips from gameplay mashing
    useEffect(() => {
        const t1 = setTimeout(() => setAllowSkip(true), 1500);
        const t2 = setTimeout(() => setShowPrompt(true), 3000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);


    useEffect(() => {
        const handleInput = (e) => {
            if (!allowSkip) return;
            e.preventDefault();
            e.stopPropagation();
            handleComplete();
        };

        window.addEventListener("keydown", handleInput);
        window.addEventListener("mousedown", handleInput);
        window.addEventListener("touchstart", handleInput);

        return () => {
            window.removeEventListener("keydown", handleInput);
            window.removeEventListener("mousedown", handleInput);
            window.removeEventListener("touchstart", handleInput);
        };
    }, [handleComplete, allowSkip]);


    if (!runSummary) return null;

    const videoSrc = runSummary.victory ? victoryVideo : defeatVideo;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "black",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {videoReady ? (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    autoPlay
                    onEnded={handleComplete}
                    muted={false}
                    playsInline
                />
            ) : (
                <div
                    style={{
                        color: "rgba(255, 255, 255, 0.5)",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        letterSpacing: "0.2em",
                    }}
                >
                    LOADING...
                </div>
            )}
            {
                showPrompt && (
                    <div style={{
                        position: "absolute",
                        bottom: "40px",
                        left: 0,
                        width: "100%",
                        textAlign: "center",
                        color: "rgba(255, 255, 255, 0.5)",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                        animation: "pulse 2s infinite"
                    }}>
                        Press any key to skip
                    </div>
                )}
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 0.3; }
                        50% { opacity: 0.8; }
                        100% { opacity: 0.3; }
                    }
                `}
            </style>
        </div>
    );
}

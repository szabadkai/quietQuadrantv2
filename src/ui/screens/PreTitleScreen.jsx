import React, { useState, useEffect, useRef } from "react";
import paperwhaleVideo from "../../../assets/paperwhale.mp4";
import introVideo from "../../../assets/intro.mp4";

const sequence = [
    {
        type: "video",
        src: paperwhaleVideo,
        style: { width: "50%", height: "50%", objectFit: "contain" },
    },
    {
        type: "video",
        src: introVideo,
        style: { width: "100%", height: "100%", objectFit: "contain" },
    },
];

export function PreTitleScreen({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [waitingForClick, setWaitingForClick] = useState(false);
    const containerRef = useRef(null);
    const videoRef = useRef(null);

    const handleEnded = React.useCallback(() => {
        if (currentIndex < sequence.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setWaitingForClick(true);
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    }, [currentIndex]);

    // Handle video playback
    useEffect(() => {
        const item = sequence[currentIndex];
        if (item.type === "video" && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {
                // ignore auto-play errors
            });
        }
    }, [currentIndex]);

    useEffect(() => {
        // Focus the container to capture key events
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [currentIndex]);

    const handleKeyDown = (e) => {
        if (["Space", "Escape", "Enter"].includes(e.code)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleKeyUp = (e) => {
        if (["Space", "Escape", "Enter"].includes(e.code)) {
            e.preventDefault();
            e.stopPropagation();
            onComplete();
        }
    };

    const currentItem = sequence[currentIndex];

    return (
        <div
            ref={containerRef}
            tabIndex="-1"
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
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
                outline: "none",
            }}
            onClick={() => waitingForClick && onComplete()}
        >
            <video
                ref={videoRef}
                key={currentIndex}
                src={currentItem.src}
                style={currentItem.style}
                onEnded={handleEnded}
                muted={false}
                loop={false}
                playsInline
            />

            {waitingForClick && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            color: "white",
                            fontFamily: "monospace",
                            fontSize: "1.5rem",
                            letterSpacing: "0.2em",
                            opacity: 0.8,
                            animation: "pulse 2s infinite",
                        }}
                    >
                        CLICK TO CONTINUE
                    </div>
                </div>
            )}
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 0.4; }
                        50% { opacity: 1; }
                        100% { opacity: 0.4; }
                    }
                `}
            </style>
        </div>
    );
}

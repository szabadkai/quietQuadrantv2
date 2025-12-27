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
    const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
    const containerRef = useRef(null);
    const videoRef = useRef(null);

    const handleEnded = React.useCallback(() => {
        if (currentIndex < sequence.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setNeedsTapToPlay(false);
        } else {
            setWaitingForClick(true);
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    }, [currentIndex]);

    // Attempt to play video with mobile-friendly approach
    const attemptPlay = React.useCallback(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        video.currentTime = 0;

        // Use requestAnimationFrame for more reliable mobile playback
        requestAnimationFrame(() => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setNeedsTapToPlay(false);
                    })
                    .catch((error) => {
                        console.log("Autoplay prevented:", error.message);
                        // On mobile, autoplay often fails - show tap to play
                        setNeedsTapToPlay(true);
                    });
            }
        });
    }, []);

    // Handle video playback
    useEffect(() => {
        const item = sequence[currentIndex];
        if (item.type === "video" && videoRef.current) {
            attemptPlay();
        }
    }, [currentIndex, attemptPlay]);

    // Handle tap to start video on mobile
    const handleTapToPlay = () => {
        if (needsTapToPlay && videoRef.current) {
            videoRef.current.play()
                .then(() => setNeedsTapToPlay(false))
                .catch(console.error);
        }
    };

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
            onClick={() => {
                if (needsTapToPlay) {
                    handleTapToPlay();
                } else if (waitingForClick) {
                    onComplete();
                }
            }}
        >
            <video
                ref={videoRef}
                key={currentIndex}
                src={currentItem.src}
                style={currentItem.style}
                onEnded={handleEnded}
                muted={currentIndex === 0}
                loop={false}
                playsInline
            />

            {needsTapToPlay && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        cursor: "pointer",
                    }}
                >
                    <div
                        style={{
                            color: "white",
                            fontFamily: "monospace",
                            fontSize: "1.5rem",
                            letterSpacing: "0.2em",
                            opacity: 0.9,
                            animation: "pulse 2s infinite",
                        }}
                    >
                        TAP TO PLAY
                    </div>
                </div>
            )}

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

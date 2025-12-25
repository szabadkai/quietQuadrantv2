import React, { useEffect, useState } from "react";
import { useMetaStore } from "../../state/useMetaStore.js";
import { Button } from "../components/Button.jsx";

const ANIMATION_DURATION = 220;

export function StreakPopup() {
    const popup = useMetaStore((s) => s.streakPopup);
    const hideStreakPopup = useMetaStore((s) => s.actions.hideStreakPopup);
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        let timer;
        if (popup.show) {
            setMounted(true);
            timer = setTimeout(() => setVisible(true), 100);
        } else {
            setVisible(false);
            timer = setTimeout(() => setMounted(false), ANIMATION_DURATION);
        }
        return () => clearTimeout(timer);
    }, [popup.show]);

    if (!mounted && !popup.show) return null;

    const dismiss = () => {
        setVisible(false);
        setTimeout(() => hideStreakPopup(), ANIMATION_DURATION);
    };

    return (
        <div
            className={`qq-streak-overlay ${visible ? "visible" : ""}`}
            onClick={dismiss}
        >
            <div
                className={`qq-streak-modal ${visible ? "animate-in" : "animate-out"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="qq-streak-badge">
                    <span className="qq-streak-fire">🔥</span>
                    <span className="qq-streak-number">{popup.count}</span>
                </div>
                <div className="qq-streak-copy">
                    <span className="qq-label">{popup.isNewBest ? "New Personal Best!" : "Daily Streak Increased!"}</span>
                    <h2>{popup.count} Day Streak</h2>
                    <p>You&apos;re on fire! Keep it up to earn more rewards.</p>
                    <div className="qq-hint">Come back tomorrow to keep the flame alive!</div>
                </div>
                <div className="qq-streak-actions">
                    <Button primary onClick={dismiss}>
                        Keep it up!
                    </Button>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { useMetaStore } from "../../state/useMetaStore.js";
import { Button } from "../components/Button.jsx";

const ANIMATION_DURATION = 220;

export function AchievementPopup() {
    const popup = useMetaStore((s) => s.achievementPopup);
    const hideAchievement = useMetaStore((s) => s.actions.hideAchievement);
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
    }, [popup.show, popup.synergyId]);

    if (!mounted && !popup.show) return null;

    const dismiss = () => {
        setVisible(false);
        setTimeout(() => hideAchievement(), ANIMATION_DURATION);
    };

    return (
        <div
            className={`qq-achievement-overlay ${visible ? "visible" : ""}`}
            onClick={dismiss}
        >
            <div
                className={`qq-achievement-modal ${visible ? "animate-in" : "animate-out"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="qq-achievement-badge">★</div>
                <div className="qq-achievement-copy">
                    <span className="qq-label">Achievement Unlocked!</span>
                    <h2>{popup.synergyName}</h2>
                    <p>{popup.synergyDescription}</p>
                    <div className="qq-hint">Synergy discovered!</div>
                </div>
                <div className="qq-achievement-actions">
                    <Button primary onClick={dismiss}>
            Awesome!
                    </Button>
                </div>
            </div>
        </div>
    );
}

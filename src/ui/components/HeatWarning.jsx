import React, { useState, useEffect, useRef } from "react";
import { HEAT_WARNING_THRESHOLD, HEAT_WARNING_MIN_DISPLAY_MS } from "../../utils/constants.js";

export function HeatWarning({ player }) {
    const [visible, setVisible] = useState(false);
    const showTimeRef = useRef(null);

    const heat = player?.weaponHeat ?? 0;
    const isOverheated = player?.overheatCooldown > 0;
    const shouldShow = heat >= HEAT_WARNING_THRESHOLD || isOverheated;

    useEffect(() => {
        if (shouldShow) {
            // Start showing - record the time
            if (!visible) {
                showTimeRef.current = Date.now();
            }
            setVisible(true);
        } else if (visible) {
            // Check if we've been visible long enough
            const elapsed = Date.now() - (showTimeRef.current ?? 0);
            if (elapsed >= HEAT_WARNING_MIN_DISPLAY_MS) {
                setVisible(false);
                showTimeRef.current = null;
            } else {
                // Schedule hide after remaining time
                const remaining = HEAT_WARNING_MIN_DISPLAY_MS - elapsed;
                const timeout = setTimeout(() => {
                    setVisible(false);
                    showTimeRef.current = null;
                }, remaining);
                return () => clearTimeout(timeout);
            }
        }
    }, [shouldShow, visible]);

    if (!player || !visible) return null;

    const warningClass = isOverheated
        ? "qq-heat-warning qq-heat-offline"
        : "qq-heat-warning qq-heat-critical";

    const message = isOverheated
        ? "🔥 WEAPONS OFFLINE — COOLING"
        : "⚠ WEAPON SYSTEMS OVERHEATING";

    return (
        <div className={warningClass}>
            <span className="qq-heat-message">{message}</span>
            {!isOverheated && (
                <div className="qq-heat-bar-container">
                    <div
                        className="qq-heat-bar-fill"
                        style={{ width: `${Math.min(100, heat * 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}

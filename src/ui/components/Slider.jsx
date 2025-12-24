import React, { forwardRef } from "react";

export const Slider = forwardRef(function Slider(
    { label, value, onChange, min = 0, max = 1, step = 0.05, focused },
    ref
) {
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div
            ref={ref}
            className={`qq-slider-group ${focused ? "qq-slider-focused" : ""}`}
        >
            <div className="qq-slider-header">
                <span className="qq-slider-label">{label}</span>
                <span className="qq-slider-value">{Math.round(percent)}%</span>
            </div>
            <div className="qq-slider-track">
                <div className="qq-slider-fill" style={{ width: `${percent}%` }} />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="qq-slider-input"
                />
            </div>
        </div>
    );
});

import React, { useState, useEffect } from "react";
import { soundManager } from "../../audio/SoundManager.js";
import { musicManager } from "../../audio/MusicManager.js";

const STORAGE_KEY = "quiet-quadrant-settings";
const DEFAULT_SETTINGS = {
    masterVolume: 0.7,
    musicVolume: 0.25,
    sfxVolume: 1.0,
    screenShake: true,
    screenFlash: true,
    damageNumbers: false,
    highContrast: false,
    reducedMotion: false
};

function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
        // ignore
    }
    return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        // ignore
    }
}

function applyVisualSettings(settings) {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("qq-high-contrast", settings.highContrast);
    document.body.classList.toggle("qq-reduced-motion", settings.reducedMotion);
}

function notifySettingsChanged(settings) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("qq-settings-changed", { detail: settings })
    );
}

export function SettingsPanel({ onClose }) {
    const [settings, setSettings] = useState(loadSettings);

    useEffect(() => {
        soundManager.setMasterVolume(settings.masterVolume);
        soundManager.setSFXVolume(settings.sfxVolume);
        musicManager.setMasterVolume(settings.masterVolume);
        musicManager.setMusicVolume(settings.musicVolume);
        saveSettings(settings);
        applyVisualSettings(settings);
        notifySettingsChanged(settings);
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="qq-settings-panel">
            <div className="qq-settings-title">SETTINGS</div>

            <div className="qq-settings-group">
                <div className="qq-settings-label">Master Volume</div>
                <input
                    type="range"
                    className="qq-settings-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.masterVolume}
                    onChange={(e) => updateSetting("masterVolume", parseFloat(e.target.value))}
                />
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-label">Music Volume</div>
                <input
                    type="range"
                    className="qq-settings-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={(e) => updateSetting("musicVolume", parseFloat(e.target.value))}
                />
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-label">SFX Volume</div>
                <input
                    type="range"
                    className="qq-settings-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume}
                    onChange={(e) => updateSetting("sfxVolume", parseFloat(e.target.value))}
                />
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-toggle">
                    <span className="qq-settings-label" style={{ marginBottom: 0 }}>
                        Screen Shake
                    </span>
                    <button
                        type="button"
                        className={`qq-toggle-switch ${settings.screenShake ? "active" : ""}`}
                        onClick={() => updateSetting("screenShake", !settings.screenShake)}
                        aria-pressed={settings.screenShake}
                    />
                </div>
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-toggle">
                    <span className="qq-settings-label" style={{ marginBottom: 0 }}>
                        Screen Flash
                    </span>
                    <button
                        type="button"
                        className={`qq-toggle-switch ${settings.screenFlash ? "active" : ""}`}
                        onClick={() => updateSetting("screenFlash", !settings.screenFlash)}
                        aria-pressed={settings.screenFlash}
                    />
                </div>
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-toggle">
                    <span className="qq-settings-label" style={{ marginBottom: 0 }}>
                        Damage Numbers
                    </span>
                    <button
                        type="button"
                        className={`qq-toggle-switch ${settings.damageNumbers ? "active" : ""}`}
                        onClick={() => updateSetting("damageNumbers", !settings.damageNumbers)}
                        aria-pressed={settings.damageNumbers}
                    />
                </div>
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-toggle">
                    <span className="qq-settings-label" style={{ marginBottom: 0 }}>
                        High Contrast
                    </span>
                    <button
                        type="button"
                        className={`qq-toggle-switch ${settings.highContrast ? "active" : ""}`}
                        onClick={() => updateSetting("highContrast", !settings.highContrast)}
                        aria-pressed={settings.highContrast}
                    />
                </div>
            </div>

            <div className="qq-settings-group">
                <div className="qq-settings-toggle">
                    <span className="qq-settings-label" style={{ marginBottom: 0 }}>
                        Reduced Motion
                    </span>
                    <button
                        type="button"
                        className={`qq-toggle-switch ${settings.reducedMotion ? "active" : ""}`}
                        onClick={() => updateSetting("reducedMotion", !settings.reducedMotion)}
                        aria-pressed={settings.reducedMotion}
                    />
                </div>
            </div>

            {onClose && (
                <button
                    type="button"
                    className="qq-button"
                    onClick={onClose}
                    style={{ marginTop: "16px", width: "100%" }}
                >
                    Close
                </button>
            )}
        </div>
    );
}

export function useSettings() {
    return loadSettings();
}

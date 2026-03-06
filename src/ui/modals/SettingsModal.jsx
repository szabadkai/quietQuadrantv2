import React, { useEffect, useState } from "react";
import { Button } from "../components/Button.jsx";
import { Slider } from "../components/Slider.jsx";
import { soundManager } from "../../audio/SoundManager.js";
import { musicManager } from "../../audio/MusicManager.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { isDesktop } from "../../utils/platform.js";
import { steamBridge } from "../../utils/steamBridge.js";
import { COLORBLIND_MODES, COLORBLIND_LABELS } from "../../config/colorblindPalettes.js";
import { KEYBINDINGS } from "../../config/keybindings.js";

const SETTINGS_KEY = "quiet-quadrant-settings";
const DEFAULT_SETTINGS = {
    masterVolume: 0.7,
    musicVolume: 0.25,
    sfxVolume: 1.0,
    screenShake: true,
    screenFlash: true,
    highContrast: false,
    reducedMotion: false,
    damageNumbers: false,
    crtScanlines: true,
    crtIntensity: 0.5,
    colorTheme: "vectrex",
    colorblindMode: "none",
};

const RESOLUTIONS = [
    { label: "960x600", width: 960, height: 600 },
    { label: "1200x800", width: 1200, height: 800 },
    { label: "1440x900", width: 1440, height: 900 },
    { label: "1600x1000", width: 1600, height: 1000 },
    { label: "1920x1200", width: 1920, height: 1200 },
];

function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
        // ignore
    }
    return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        // ignore
    }
}

function applyVisualSettings(settings) {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("qq-high-contrast", settings.highContrast);
    document.body.classList.toggle("qq-reduced-motion", settings.reducedMotion);
    document.body.classList.toggle("qq-no-scanlines", !(settings.crtScanlines ?? true));

    // Apply CRT intensity as CSS variable
    const intensity = settings.crtScanlines ? (settings.crtIntensity ?? 0.5) : 0;
    document.documentElement.style.setProperty("--crt-intensity", intensity);
    document.documentElement.style.setProperty("--glow-intensity", intensity);

    // Apply color theme
    const theme = settings.colorTheme || "vectrex";
    document.body.setAttribute('data-theme', theme);

    // Apply colorblind mode
    const cbMode = settings.colorblindMode || "none";
    document.body.classList.remove(
        "qq-colorblind-deuteranopia",
        "qq-colorblind-protanopia",
        "qq-colorblind-tritanopia"
    );
    if (cbMode !== "none") {
        document.body.classList.add(`qq-colorblind-${cbMode}`);
    }
}

function notifySettingsChanged(settings) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("qq-settings-changed", { detail: settings })
    );
}

export function SettingsModal({ onClose }) {
    const [settings, setSettings] = useState(loadSettings);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentResLabel, setCurrentResLabel] = useState("1200x800");
    const { actions } = useMetaStore();
    const showDesktop = isDesktop();

    // Sync fullscreen state from Electron
    useEffect(() => {
        if (!showDesktop) return;
        steamBridge.getFullscreen().then((fs) => {
            if (fs !== null) setIsFullscreen(fs);
        });
        steamBridge.getBounds().then((bounds) => {
            if (bounds) {
                const match = RESOLUTIONS.find(
                    (r) => r.width === bounds.width && r.height === bounds.height
                );
                setCurrentResLabel(match ? match.label : `${bounds.width}x${bounds.height}`);
            }
        });
    }, [showDesktop]);

    useEffect(() => {
        soundManager.setMasterVolume(settings.masterVolume);
        soundManager.setSFXVolume(settings.sfxVolume);
        musicManager.setMasterVolume(settings.masterVolume);
        musicManager.setMusicVolume(settings.musicVolume);
        saveSettings(settings);
        applyVisualSettings(settings);
        notifySettingsChanged(settings);
    }, [settings]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const Toggle = ({ label, settingKey }) => (
        <div className="qq-toggle-row">
            <span>{label}</span>
            <button
                type="button"
                className={`qq-toggle ${settings[settingKey] ? "active" : ""}`}
                onClick={() => updateSetting(settingKey, !settings[settingKey])}
            >
                {settings[settingKey] ? "ON" : "OFF"}
            </button>
        </div>
    );

    return (
        <div className="qq-modal-overlay">
            <div className="qq-modal qq-settings-modal">
                <div className="qq-modal-header">
                    <span className="qq-label">SETTINGS</span>
                </div>

                <div className="qq-settings-section">
                    <h3>Audio</h3>
                    <Slider
                        label="Master Volume"
                        value={settings.masterVolume}
                        onChange={(v) => updateSetting("masterVolume", v)}
                    />
                    <Slider
                        label="Music Volume"
                        value={settings.musicVolume}
                        onChange={(v) => updateSetting("musicVolume", v)}
                    />
                    <Slider
                        label="SFX Volume"
                        value={settings.sfxVolume}
                        onChange={(v) => updateSetting("sfxVolume", v)}
                    />
                </div>

                <div className="qq-settings-section">
                    <h3>Display</h3>
                    {showDesktop && (
                        <>
                            <div className="qq-toggle-row">
                                <span>Fullscreen</span>
                                <button
                                    type="button"
                                    className={`qq-toggle ${isFullscreen ? "active" : ""}`}
                                    onClick={async () => {
                                        await steamBridge.toggleFullscreen();
                                        const fs = await steamBridge.getFullscreen();
                                        if (fs !== null) setIsFullscreen(fs);
                                    }}
                                >
                                    {isFullscreen ? "ON" : "OFF"}
                                </button>
                            </div>
                            {!isFullscreen && (
                                <div className="qq-toggle-row">
                                    <span>Resolution</span>
                                    <button
                                        type="button"
                                        className="qq-toggle"
                                        onClick={async () => {
                                            const idx = RESOLUTIONS.findIndex(
                                                (r) => r.label === currentResLabel
                                            );
                                            const next = RESOLUTIONS[(idx + 1) % RESOLUTIONS.length];
                                            await steamBridge.setBounds({ width: next.width, height: next.height });
                                            setCurrentResLabel(next.label);
                                        }}
                                    >
                                        {currentResLabel}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    <Toggle label="Screen Shake" settingKey="screenShake" />
                    <Toggle label="Screen Flash" settingKey="screenFlash" />
                    <Toggle label="Damage Numbers" settingKey="damageNumbers" />
                    <Toggle label="CRT Scanlines" settingKey="crtScanlines" />
                    {settings.crtScanlines && (
                        <Slider
                            label="CRT Emulation"
                            value={settings.crtIntensity}
                            onChange={(v) => updateSetting("crtIntensity", v)}
                        />
                    )}
                    <div className="qq-toggle-row">
                        <span>Color Theme</span>
                        <button
                            type="button"
                            className={`qq-toggle ${settings.colorTheme === "christmas" ? "active" : ""}`}
                            onClick={() => updateSetting("colorTheme", settings.colorTheme === "christmas" ? "vectrex" : "christmas")}
                        >
                            {settings.colorTheme === "christmas" ? "CHRISTMAS" : "VECTREX"}
                        </button>
                    </div>
                </div>

                <div className="qq-settings-section">
                    <h3>Accessibility</h3>
                    <Toggle label="High Contrast" settingKey="highContrast" />
                    <Toggle label="Reduced Motion" settingKey="reducedMotion" />
                    <div className="qq-toggle-row">
                        <span>Colorblind Mode</span>
                        <button
                            type="button"
                            className={`qq-toggle ${settings.colorblindMode !== "none" ? "active" : ""}`}
                            onClick={() => {
                                const idx = COLORBLIND_MODES.indexOf(settings.colorblindMode || "none");
                                const next = COLORBLIND_MODES[(idx + 1) % COLORBLIND_MODES.length];
                                updateSetting("colorblindMode", next);
                            }}
                        >
                            {COLORBLIND_LABELS[settings.colorblindMode || "none"]}
                        </button>
                    </div>
                </div>

                <div className="qq-settings-section">
                    <h3>Controls</h3>
                    <div className="qq-keybindings">
                        <div className="qq-keybindings-group">
                            <span className="qq-keybindings-title">Keyboard</span>
                            {KEYBINDINGS.keyboard.map((b) => (
                                <div key={b.action} className="qq-keybinding-row">
                                    <span className="qq-keybinding-action">{b.action}</span>
                                    <span className="qq-keybinding-keys">{b.keys}</span>
                                </div>
                            ))}
                        </div>
                        <div className="qq-keybindings-group">
                            <span className="qq-keybindings-title">Gamepad</span>
                            {KEYBINDINGS.gamepad.map((b) => (
                                <div key={b.action} className="qq-keybinding-row">
                                    <span className="qq-keybinding-action">{b.action}</span>
                                    <span className="qq-keybinding-keys">{b.keys}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="qq-settings-section">
                    <h3>Data</h3>
                    {!showResetConfirm ? (
                        <Button
                            variant="danger"
                            onClick={() => setShowResetConfirm(true)}
                        >
                            Reset All Progress
                        </Button>
                    ) : (
                        <div className="qq-reset-confirm">
                            <p className="qq-warning">
                                This will reset ALL upgrades, unlocks, and stats.
                                This cannot be undone!
                            </p>
                            <div className="qq-reset-actions">
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        actions.resetProgress();
                                        setShowResetConfirm(false);
                                        onClose();
                                    }}
                                >
                                    Yes, Reset Everything
                                </Button>
                                <Button onClick={() => setShowResetConfirm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="qq-modal-actions">
                    <Button primary onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}

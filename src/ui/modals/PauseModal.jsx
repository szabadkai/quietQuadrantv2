import React, { useEffect, useState } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { Button } from "../components/Button.jsx";
import { Slider } from "../components/Slider.jsx";
import { soundManager } from "../../audio/SoundManager.js";
import { musicManager } from "../../audio/MusicManager.js";

const SETTINGS_KEY = "quiet-quadrant-settings";
const DEFAULT_SETTINGS = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 1.0,
  screenShake: true,
  screenFlash: true,
  damageNumbers: false,
  highContrast: false,
  reducedMotion: false,
  crtScanlines: true,
  crtIntensity: 0.5,
  colorTheme: "vectrex"
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (e) {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

function applyVisualSettings(settings) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("qq-high-contrast", settings.highContrast);
  document.body.classList.toggle("qq-reduced-motion", settings.reducedMotion);
  document.body.classList.toggle("qq-no-scanlines", !(settings.crtScanlines ?? true));
  
  // Apply CRT intensity as CSS variable
  const intensity = settings.crtIntensity ?? 0.5;
  document.documentElement.style.setProperty('--crt-intensity', intensity);
  document.documentElement.style.setProperty('--glow-intensity', intensity);
  
  // Apply color theme
  const theme = settings.colorTheme || "vectrex";
  document.body.setAttribute('data-theme', theme);
}

function notifySettingsChanged(settings) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("qq-settings-changed", { detail: settings })
  );
}

export function PauseModal({ onResume }) {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const stopGame = useGameStore((s) => s.actions.stopGame);
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

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onResume]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuit = () => {
    stopGame();
    setScreen("title");
  };

  return (
    <div className="qq-modal-overlay">
      <div className="qq-modal qq-pause-modal">
        <div className="qq-modal-header">
          <span className="qq-label">PAUSED</span>
        </div>

        <div className="qq-pause-settings">
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

          <div className="qq-toggle-row">
            <span>Screen Shake</span>
            <button
              type="button"
              className={`qq-toggle ${settings.screenShake ? "active" : ""}`}
              onClick={() => updateSetting("screenShake", !settings.screenShake)}
            >
              {settings.screenShake ? "ON" : "OFF"}
            </button>
          </div>

          <div className="qq-toggle-row">
            <span>Screen Flash</span>
            <button
              type="button"
              className={`qq-toggle ${settings.screenFlash ? "active" : ""}`}
              onClick={() => updateSetting("screenFlash", !settings.screenFlash)}
            >
              {settings.screenFlash ? "ON" : "OFF"}
            </button>
          </div>

          <div className="qq-toggle-row">
            <span>Damage Numbers</span>
            <button
              type="button"
              className={`qq-toggle ${settings.damageNumbers ? "active" : ""}`}
              onClick={() =>
                updateSetting("damageNumbers", !settings.damageNumbers)
              }
            >
              {settings.damageNumbers ? "ON" : "OFF"}
            </button>
          </div>

          <div className="qq-toggle-row">
            <span>High Contrast</span>
            <button
              type="button"
              className={`qq-toggle ${settings.highContrast ? "active" : ""}`}
              onClick={() => updateSetting("highContrast", !settings.highContrast)}
            >
              {settings.highContrast ? "ON" : "OFF"}
            </button>
          </div>

          <div className="qq-toggle-row">
            <span>Reduced Motion</span>
            <button
              type="button"
              className={`qq-toggle ${settings.reducedMotion ? "active" : ""}`}
              onClick={() =>
                updateSetting("reducedMotion", !settings.reducedMotion)
              }
            >
              {settings.reducedMotion ? "ON" : "OFF"}
            </button>
          </div>

          <div className="qq-toggle-row">
            <span>CRT Emulation</span>
            <button
              type="button"
              className={`qq-toggle ${settings.crtScanlines ? "active" : ""}`}
              onClick={() =>
                updateSetting("crtScanlines", !settings.crtScanlines)
              }
            >
              {settings.crtScanlines ? "ON" : "OFF"}
            </button>
          </div>

          {settings.crtScanlines && (
            <Slider
              label="CRT Intensity"
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

        <div className="qq-modal-actions">
          <Button primary onClick={onResume}>
            Resume
          </Button>
          <Button onClick={handleQuit}>
            Quit to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}

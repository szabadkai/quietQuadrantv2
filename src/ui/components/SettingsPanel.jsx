import React, { useState, useEffect } from "react";
import { soundManager } from "../../audio/SoundManager.js";
import { musicManager } from "../../audio/MusicManager.js";

const STORAGE_KEY = "quiet-quadrant-settings";

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 1.0,
    screenShake: true,
    screenFlash: true,
    highContrast: false
  };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    soundManager.setMasterVolume(settings.masterVolume);
    soundManager.setSFXVolume(settings.sfxVolume);
    musicManager.setMasterVolume(settings.masterVolume);
    musicManager.setMusicVolume(settings.musicVolume);
    saveSettings(settings);
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

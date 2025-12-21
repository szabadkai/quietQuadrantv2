import React, { useEffect, useState } from "react";
import { Button } from "../components/Button.jsx";
import { Slider } from "../components/Slider.jsx";
import { soundManager } from "../../audio/SoundManager.js";
import { musicManager } from "../../audio/MusicManager.js";

const SETTINGS_KEY = "quiet-quadrant-settings";

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 1.0,
    screenShake: true,
    screenFlash: true,
    highContrast: false,
    reducedMotion: false,
    damageNumbers: false
  };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    soundManager.setMasterVolume(settings.masterVolume);
    soundManager.setSFXVolume(settings.sfxVolume);
    musicManager.setMasterVolume(settings.masterVolume);
    musicManager.setMusicVolume(settings.musicVolume);
    saveSettings(settings);
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
          <Toggle label="Screen Shake" settingKey="screenShake" />
          <Toggle label="Screen Flash" settingKey="screenFlash" />
          <Toggle label="Damage Numbers" settingKey="damageNumbers" />
        </div>

        <div className="qq-settings-section">
          <h3>Accessibility</h3>
          <Toggle label="High Contrast" settingKey="highContrast" />
          <Toggle label="Reduced Motion" settingKey="reducedMotion" />
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

import React, { useEffect, useState } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
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
    screenShake: true
  };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
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

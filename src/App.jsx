import React, { useEffect } from "react";
import "./ui/styles.css";
import { useUIStore } from "./state/useUIStore.js";
import { TitleScreen } from "./ui/screens/TitleScreen.jsx";
import { GameScreen } from "./ui/screens/GameScreen.jsx";
import { SummaryScreen } from "./ui/screens/SummaryScreen.jsx";
import { StatsScreen } from "./ui/screens/StatsScreen.jsx";
import { CollectionScreen } from "./ui/screens/CollectionScreen.jsx";
import { HowToPlayScreen } from "./ui/screens/HowToPlayScreen.jsx";
import { MultiplayerSetupScreen } from "./ui/screens/MultiplayerSetupScreen.jsx";
import { HostGameScreen } from "./ui/screens/HostGameScreen.jsx";
import { JoinGameScreen } from "./ui/screens/JoinGameScreen.jsx";
import { TwinSetupScreen } from "./ui/screens/TwinSetupScreen.jsx";
import { NotificationToast } from "./ui/components/NotificationToast.jsx";
import { useGlobalNavigation } from "./ui/hooks/useGlobalNavigation.js";

const SETTINGS_KEY = "quiet-quadrant-settings";
const DEFAULT_SETTINGS = {
  crtScanlines: true,
  crtIntensity: 0.5,
  highContrast: false,
  reducedMotion: false
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (e) {}
  return { ...DEFAULT_SETTINGS };
}

function applyInitialSettings() {
  const settings = loadSettings();
  if (typeof document === "undefined") return;
  
  document.body.classList.toggle("qq-high-contrast", settings.highContrast ?? false);
  document.body.classList.toggle("qq-reduced-motion", settings.reducedMotion ?? false);
  document.body.classList.toggle("qq-no-scanlines", !(settings.crtScanlines ?? true));
  
  // Apply CRT intensity as CSS variable
  const intensity = settings.crtIntensity ?? 0.5;
  document.documentElement.style.setProperty('--crt-intensity', intensity);
  document.documentElement.style.setProperty('--glow-intensity', intensity);
}

export function App() {
  const screen = useUIStore((s) => s.screen);
  useGlobalNavigation();

  useEffect(() => {
    applyInitialSettings();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {screen === "title" && <TitleScreen />}
      {screen === "game" && <GameScreen />}
      {screen === "summary" && <SummaryScreen />}
      {screen === "stats" && <StatsScreen />}
      {screen === "collection" && <CollectionScreen />}
      {screen === "howtoplay" && <HowToPlayScreen />}
      {screen === "multiplayer" && <MultiplayerSetupScreen />}
      {screen === "host" && <HostGameScreen />}
      {screen === "join" && <JoinGameScreen />}
      {screen === "twin" && <TwinSetupScreen />}
      <NotificationToast />
    </div>
  );
}

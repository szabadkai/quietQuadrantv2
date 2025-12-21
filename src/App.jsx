import React from "react";
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

export function App() {
  const screen = useUIStore((s) => s.screen);

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

import React, { useEffect, useState } from "react";

const WAVE_TITLES = [
  "Swarm Awakening",
  "Hive Fracture",
  "Core Breach",
  "Tendril Storm",
  "Biomass Surge",
  "Nest Collapse",
  "Drone Cascade",
  "Queen Spawn",
  "Void Swarm",
  "Hull Shredders",
  "Plasma Barrage",
  "Chitin Swarm",
  "Burrow Assault",
  "Winged Horror",
  "Acid Rain",
  "Reinforced Shells",
  "Feral Pack",
  "Overload Pulse",
  "Spore Cloud",
  "Titan Emergence",
  "Fractured Core",
  "Relentless Tide",
  "Adaptive Swarm",
  "Necrotic Wave",
  "Hive Overmind",
  "Cataclysm Swarm",
  "Final Convergence",
  "Abyss Breakers",
  "Extinction Swarm",
  "Swarm Eclipse",
];

const TOTAL_WAVES = 10;

export function WaveAnnouncement({ waveNumber, onComplete }) {
  const [visible, setVisible] = useState(true);
  const [title] = useState(() => 
    WAVE_TITLES[Math.floor(Math.random() * WAVE_TITLES.length)]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="qq-wave-announcement">
      <div className="qq-wave-announcement-box">
        <div className="qq-wave-round">Wave {waveNumber} / {TOTAL_WAVES}</div>
        <div className="qq-wave-countdown">{waveNumber}</div>
        <div className="qq-wave-title">{title}</div>
      </div>
    </div>
  );
}

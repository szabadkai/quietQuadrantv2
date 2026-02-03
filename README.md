# Quiet Quadrant v2

A minimalist roguelike space shooter with seamless P2P multiplayer. Pilot fragile ships in a bounded arena, surviving escalating waves and bullet-hell bosses. Clean visuals, tight controls, and meaningful upgrade choices define each 12-18 minute run.

## Features

-   **Instant Playability**: Game loads in 3 seconds, controls learned in 10
-   **Solo & Multiplayer**: Play alone or with a friend via 6-character room codes
-   **Roguelike Progression**: 30+ upgrades with synergy combinations
-   **Multiple Bosses**: 3 unique boss types with distinct attack patterns
-   **Cross-Platform**: Web, mobile (iOS/Android), and desktop (Windows/macOS/Linux)
-   **No Servers Required**: P2P networking, works offline for solo play

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

Open [http://localhost:5173](http://localhost:5173) to play.

## Game Modes

-   **Standard**: 10 waves + boss fight (12-18 minutes)
-   **Infinite**: Endless waves with scaling difficulty
-   **Twin**: Local co-op on same device
-   **Online**: P2P multiplayer with friend

## Controls

### Desktop

-   **WASD**: Move
-   **Mouse**: Aim and shoot
-   **Space**: Dash
-   **Gamepad**: Full support

### Mobile

-   **Virtual Sticks**: Move and aim
-   **Touch**: Auto-fire when aiming

## Tech Stack

-   **Frontend**: React 18 + Vite
-   **Game Engine**: Phaser 3.80+
-   **Networking**: Trystero (WebRTC P2P)
-   **State**: Zustand
-   **Mobile**: Capacitor (iOS/Android)
-   **Desktop**: Electron (Windows/macOS/Linux)

## Architecture

The game uses a clean separation between simulation and rendering:

-   **Simulation Layer**: Pure JavaScript game logic (60Hz fixed timestep)
-   **Rendering Layer**: Phaser handles visuals only
-   **UI Layer**: React for menus and HUD
-   **Network Layer**: Deterministic input sync for multiplayer

## Development

### Project Structure

```
src/
├── simulation/     # Pure game logic (no Phaser)
├── rendering/      # Phaser renderers (read-only)
├── ui/            # React components
├── network/       # P2P multiplayer
├── state/         # Zustand stores
├── config/        # Game data (enemies, upgrades, waves)
└── audio/         # Sound management
```

### Key Principles

-   **Deterministic**: Same inputs + seed = identical results
-   **File Size Limit**: 300 lines max per file
-   **Performance First**: 60fps on mid-range devices
-   **Mobile Ready**: Touch controls and responsive design

### Building for Platforms

```bash
# Web (GitHub Pages)
npm run build

# Mobile apps
npm run build
npx cap sync
npx cap open ios     # or android

# Desktop apps
npm run electron:build
```

## Multiplayer

Uses WebRTC for serverless P2P connections:

-   Host creates room with 6-character code
-   Guest joins with code
-   Input-based synchronization (20Hz)
-   Automatic reconnection on disconnect

## Game Design

### Core Loop

1. Survive waves of enemies
2. Collect XP to level up
3. Choose from 3 random upgrades
4. Build synergistic combinations
5. Face the boss on wave 11

### Upgrade System

-   **Common** (65%): Reliable stat boosts
-   **Rare** (30%): Powerful effects
-   **Legendary** (5%): Build-defining transformations
-   **Synergies**: Special bonuses for upgrade combinations

### Enemy Types

-   **Drifter**: Chases player directly
-   **Watcher**: Maintains distance, shoots
-   **Mass**: Slow tank with radial bursts
-   **Phantom**: Teleports unpredictably
-   **Orbiter**: Circles while shooting
-   **Splitter**: Divides on death

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the 300-line file limit
4. Add tests for new features
5. Submit a pull request

---

_"A minimalist void where clean lines, tight movement, and small choices decide survival—now with a friend."_

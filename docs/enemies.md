# Enemies

This document describes all enemy types in Quiet Quadrant, including their appearance, behavior, and stats.

---

## Drifter

![Drifter](file:///Users/lszabadkai/quietQuadrantv2/docs/sprites/drifter.svg)

### Appearance
A circular drone-like enemy with a cyan glowing core. Features concentric rings (outer gray, inner cyan) surrounding a dark hull center. Has rectangular appendages protruding from the bottom and sides.

### Behavior
- **Movement**: Directly chases the nearest player in a straight line
- **Attack**: Contact damage only — no ranged attacks

### Stats
| Stat           | Value |
|----------------|-------|
| Health         | 28    |
| Speed          | 115   |
| Contact Damage | 1     |
| XP             | 10    |

### Elite Variant
- **Elite Behavior**: `burst` — periodically gains a 1.7× speed boost for a short burst

---

## Watcher

![Watcher](file:///Users/lszabadkai/quietQuadrantv2/docs/sprites/watcher.svg)

### Appearance
A squared enemy with rounded corners and a prominent central eye. Dark body outlined in blue-gray with cyan crosshairs overlaid. Features a glowing cyan eye with a dark pupil and a white glint highlight.

### Behavior
- **Movement**: Kites the player — approaches until ~240px away, then strafes sideways to maintain distance
- **Attack**: Fires single projectiles at the player every 90 ticks (1.5 seconds)

### Stats
| Stat           | Value |
|----------------|-------|
| Health         | 45    |
| Speed          | 75    |
| Contact Damage | 1     |
| Bullet Damage  | 1     |
| Bullet Speed   | 165   |
| Fire Cooldown  | 90 ticks |
| XP             | 10    |

### Elite Variant
- **Elite Behavior**: `rapid-fire` — fire cooldown reduced to 65% (58 ticks)

---

## Mass

![Mass](file:///Users/lszabadkai/quietQuadrantv2/docs/sprites/mass.svg)

### Appearance
A diamond-shaped heavy enemy with a dark brown hull outlined in amber/orange. Features a rectangular viewport near the top and horizontal detail lines across the body.

### Behavior
- **Movement**: Slowly pursues the player in a direct line
- **Attack**: Periodically fires an 8-bullet radial burst in all directions (every 144 ticks / 2.4 seconds)

### Stats
| Stat           | Value |
|----------------|-------|
| Health         | 110   |
| Speed          | 50    |
| Contact Damage | 2     |
| Bullet Damage  | 1     |
| Bullet Speed   | 125   |
| Fire Cooldown  | 144 ticks |
| XP             | 10    |

### Elite Variant
- **Elite Behavior**: `burst-death` — gains speed bursts like Drifter, plus additional death effects

---

## Phantom

![Phantom](file:///Users/lszabadkai/quietQuadrantv2/docs/sprites/phantom.svg)

### Appearance
A hexagonal enemy with a dark hull and gray outline. Features an inner hexagon pattern in cyan and a glowing cyan core with a dark center.

### Behavior
- **Movement**: Chases the player directly, but periodically teleports to a random position near the player (80–140px away)
- **Attack**: Contact damage only — no ranged attacks
- **Teleport Cooldown**: 180–240 ticks (3–4 seconds) between teleports

### Stats
| Stat           | Value |
|----------------|-------|
| Health         | 24    |
| Speed          | 95    |
| Contact Damage | 1     |
| XP             | 10    |

### Elite Variant
- **Elite Behavior**: `burst` — periodically gains 1.7× speed boost for a short burst

---

## Orbiter

![Orbiter](file:///Users/lszabadkai/quietQuadrantv2/docs/sprites/orbiter.svg)

### Appearance
A triangular fighter-style enemy with a dark body and gray outline. Features small rectangular wings protruding from both sides and a glowing cyan core with a dark center.

### Behavior
- **Movement**: Orbits around the player at a fixed radius (~180px), circling either clockwise or counter-clockwise
- **Attack**: Fires single projectiles at the player while orbiting (every 114 ticks / 1.9 seconds)

### Stats
| Stat           | Value |
|----------------|-------|
| Health         | 36    |
| Speed          | 135   |
| Contact Damage | 1     |
| Bullet Damage  | 1     |
| Bullet Speed   | 150   |
| Fire Cooldown  | 114 ticks |
| XP             | 10    |

### Elite Variant
- **Elite Behavior**: `rapid-fire` — fire cooldown reduced to 65% (74 ticks)

---

## Splitter

![Splitter](file:///Users/lszabadkai/quietQuadrantv2/docs/sprites/splitter.svg)

### Appearance
A cross/plus-shaped enemy with a dark body and gray outline. Features cyan seam lines running through the center vertically and horizontally, with a glowing cyan core.

### Behavior
- **Movement**: Directly chases the nearest player
- **Attack**: Contact damage only — no ranged attacks
- **Special**: Splits into smaller enemies on death (implied by name and death-explosion elite behavior)

### Stats
| Stat           | Value |
|----------------|-------|
| Health         | 65    |
| Speed          | 65    |
| Contact Damage | 1     |
| XP             | 10    |

### Elite Variant
- **Elite Behavior**: `death-explosion` — explodes on death, dealing damage in an area

---

## Elite Modifiers

All elite variants receive the following stat multipliers:

| Modifier | Multiplier |
|----------|------------|
| Health   | 1.8×       |
| Speed    | 1.3×       |
| Damage   | 1.25×      |

Elite enemies have unique visual variants (see `elite-*.svg` sprites) and enhanced behaviors as listed above.

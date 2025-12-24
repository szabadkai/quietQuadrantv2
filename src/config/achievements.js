export const ACHIEVEMENTS = {
    firstBlood: {
        id: "firstBlood",
        name: "First Blood",
        description: "Kill your first enemy",
        icon: "🎯",
        category: "progression",
        check: (run) => run.kills >= 1
    },
    waveRider: {
        id: "waveRider",
        name: "Wave Rider",
        description: "Clear wave 5",
        icon: "🌊",
        category: "progression",
        check: (run) => run.wave >= 5
    },
    bossSlayer: {
        id: "bossSlayer",
        name: "Boss Slayer",
        description: "Defeat the boss",
        icon: "👑",
        category: "progression",
        check: (run) => run.bossDefeated
    },
    perfectionist: {
        id: "perfectionist",
        name: "Perfectionist",
        description: "Beat the boss without taking damage",
        icon: "✨",
        category: "progression",
        check: (run) => run.bossDefeated && run.damageTaken === 0
    },
    speedDemon: {
        id: "speedDemon",
        name: "Speed Demon",
        description: "Beat the boss in under 8 minutes",
        icon: "⚡",
        category: "progression",
        check: (run) => run.bossDefeated && run.duration <= 8 * 60
    },
    marathon: {
        id: "marathon",
        name: "Marathon",
        description: "Survive for 20 minutes",
        icon: "⏱️",
        category: "progression",
        check: (run) => run.duration >= 20 * 60
    },
    sharpshooter: {
        id: "sharpshooter",
        name: "Sharpshooter",
        description: "90% accuracy in a run",
        icon: "🎯",
        category: "combat",
        check: (run) => run.accuracy >= 0.9 && run.shotsFired >= 50
    },
    overkill: {
        id: "overkill",
        name: "Overkill",
        description: "Deal 500 damage in one shot",
        icon: "💥",
        category: "combat",
        check: (run) => run.highestHit >= 500
    },
    chainReaction: {
        id: "chainReaction",
        name: "Chain Reaction",
        description: "Kill 5 enemies with one explosive",
        icon: "🧨",
        category: "combat",
        check: (run) => run.maxMultiKill >= 5
    },
    untouchable: {
        id: "untouchable",
        name: "Untouchable",
        description: "Clear 3 waves without taking damage",
        icon: "🛡️",
        category: "combat",
        check: (run) => run.damageTaken === 0 && run.wave >= 3
    },
    closeCall: {
        id: "closeCall",
        name: "Close Call",
        description: "Kill boss with 1 HP remaining",
        icon: "🩹",
        category: "combat",
        check: (run) => run.bossDefeated && run.endHealth === 1
    },
    glassCannon: {
        id: "glassCannon",
        name: "Glass Cannon",
        description: "Win with 1 max HP",
        icon: "🥃",
        category: "build",
        check: (run) => run.bossDefeated && run.maxHealth === 1
    },
    tank: {
        id: "tank",
        name: "Tank",
        description: "Win with 8+ max HP",
        icon: "🛡️",
        category: "build",
        check: (run) => run.bossDefeated && run.maxHealth >= 8
    },
    bulletHell: {
        id: "bulletHell",
        name: "Bullet Hell",
        description: "Have 5+ projectiles",
        icon: "☄️",
        category: "build",
        check: (run) => run.maxProjectiles >= 5
    },
    speedster: {
        id: "speedster",
        name: "Speedster",
        description: "Reach 400+ move speed",
        icon: "🏎️",
        category: "build",
        check: (run) => run.maxMoveSpeed >= 400
    },
    vampire: {
        id: "vampire",
        name: "Vampire",
        description: "Heal 10+ HP in one run",
        icon: "🩸",
        category: "build",
        check: (run) => run.totalHealing >= 10
    },
    teamPlayer: {
        id: "teamPlayer",
        name: "Team Player",
        description: "Complete a multiplayer run",
        icon: "🤝",
        category: "multiplayer",
        check: (run) => run.multiplayer && run.bossDefeated
    },
    carry: {
        id: "carry",
        name: "Carry",
        description: "Deal 80% of team damage",
        icon: "🏋️",
        category: "multiplayer",
        check: (run) => run.multiplayer && run.teamDamageShare >= 0.8
    },
    reviver: {
        id: "reviver",
        name: "Reviver",
        description: "Partner respawns 3 times",
        icon: "🫶",
        category: "multiplayer",
        check: (run) => run.partnerRevives >= 3
    },
    synchronized: {
        id: "synchronized",
        name: "Synchronized",
        description: "Both players pick same upgrade",
        icon: "🧬",
        category: "multiplayer",
        check: (run) => run.syncedUpgradePicks >= 1
    },
    secret01: {
        id: "secret01",
        name: "???",
        description: "Hidden achievement",
        icon: "❓",
        category: "secret",
        check: (run) => run.secretFlags?.includes("secret01")
    },
    secret02: {
        id: "secret02",
        name: "???",
        description: "Hidden achievement",
        icon: "❓",
        category: "secret",
        check: (run) => run.secretFlags?.includes("secret02")
    },
    secret03: {
        id: "secret03",
        name: "???",
        description: "Hidden achievement",
        icon: "❓",
        category: "secret",
        check: (run) => run.secretFlags?.includes("secret03")
    },
    synergyBlackHole: {
        id: "synergyBlackHole",
        name: "Black Hole Sun",
        description: "Unlock the Black Hole Sun synergy",
        icon: "🕳️",
        category: "build",
        check: (run) => run.synergies?.includes("black-hole-sun")
    },
    synergyRailgun: {
        id: "synergyRailgun",
        name: "Railgun",
        description: "Unlock the Railgun synergy",
        icon: "🚄",
        category: "build",
        check: (run) => run.synergies?.includes("railgun")
    },
    synergyTesla: {
        id: "synergyTesla",
        name: "Tesla Coil",
        description: "Unlock the Tesla Coil synergy",
        icon: "⚡",
        category: "build",
        check: (run) => run.synergies?.includes("tesla-coil")
    },
    synergyVampire: {
        id: "synergyVampire",
        name: "Vampire",
        description: "Unlock the Vampire synergy",
        icon: "🦇",
        category: "build",
        check: (run) => run.synergies?.includes("vampire")
    },
    synergyImmortal: {
        id: "synergyImmortal",
        name: "Immortal Engine",
        description: "Unlock the Immortal Engine synergy",
        icon: "♾️",
        category: "build",
        check: (run) => run.synergies?.includes("immortal-engine")
    },
    synergyPrism: {
        id: "synergyPrism",
        name: "Prism Cannon",
        description: "Unlock the Prism Cannon synergy",
        icon: "🔮",
        category: "build",
        check: (run) => run.synergies?.includes("prism-cannon")
    },
    synergyGlassStorm: {
        id: "synergyGlassStorm",
        name: "Glass Storm",
        description: "Unlock the Glass Storm synergy",
        icon: "🌪️",
        category: "build",
        check: (run) => run.synergies?.includes("glass-storm")
    }
};

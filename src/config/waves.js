export const WAVES = [
    {
        id: "wave-1",
        enemies: [{ kind: "drifter", count: 15 }],
    },
    {
        id: "wave-2",
        enemies: [
            { kind: "drifter", count: 15 },
            { kind: "watcher", count: 2 },
        ],
    },
    {
        id: "wave-3",
        enemies: [
            { kind: "drifter", count: 18 },
            { kind: "watcher", count: 2 },
            { kind: "phantom", count: 2 },
        ],
    },
    {
        id: "wave-4",
        enemies: [
            { kind: "drifter", count: 18 },
            { kind: "watcher", count: 3 },
            { kind: "orbiter", count: 2 },
            { kind: "phantom", count: 1 },
        ],
    },
    {
        id: "wave-5",
        enemies: [
            { kind: "drifter", count: 20 },
            { kind: "watcher", count: 3 },
            { kind: "phantom", count: 2 },
            { kind: "mass", count: 2 },
            { kind: "orbiter", count: 1 },
        ],
    },
    {
        id: "wave-6",
        enemies: [
            { kind: "drifter", count: 7, elite: true },
            { kind: "watcher", count: 3, elite: true },
            { kind: "orbiter", count: 3 },
            { kind: "splitter", count: 2 },
            { kind: "phantom", count: 2 },
        ],
    },
    {
        id: "wave-7",
        enemies: [
            { kind: "drifter", count: 8, elite: true },
            { kind: "watcher", count: 4, elite: true },
            { kind: "phantom", count: 3 },
            { kind: "orbiter", count: 2 },
            { kind: "mass", count: 2 },
            { kind: "splitter", count: 1 },
        ],
    },
    {
        id: "wave-8",
        enemies: [
            { kind: "drifter", count: 9, elite: true },
            { kind: "watcher", count: 4, elite: true },
            { kind: "phantom", count: 3, elite: true },
            { kind: "orbiter", count: 3 },
            { kind: "splitter", count: 2 },
            { kind: "mass", count: 2 },
        ],
    },
    {
        id: "wave-9",
        enemies: [
            { kind: "drifter", count: 10, elite: true },
            { kind: "watcher", count: 5, elite: true },
            { kind: "phantom", count: 4, elite: true },
            { kind: "orbiter", count: 3, elite: true },
            { kind: "splitter", count: 2 },
            { kind: "mass", count: 3 },
        ],
    },
    {
        id: "wave-10",
        enemies: [
            { kind: "drifter", count: 12, elite: true },
            { kind: "watcher", count: 5, elite: true },
            { kind: "phantom", count: 4, elite: true },
            { kind: "orbiter", count: 4, elite: true },
            { kind: "splitter", count: 3, elite: true },
            { kind: "mass", count: 3, elite: true },
        ],
    },
    {
        id: "boss",
        enemies: [{ kind: "boss", count: 1 }],
    },
];

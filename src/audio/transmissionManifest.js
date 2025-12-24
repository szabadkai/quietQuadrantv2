const GENERAL_TRANSMISSIONS = [
    "./transmissions/ancient_alien.mp3",
    "./transmissions/ancient_warmachines.mp3",
    "./transmissions/brass_says.mp3",
    "./transmissions/can_we_have.mp3",
    "./transmissions/combat_performance.mp3",
    "./transmissions/coms-are-on.mp3",
    "./transmissions/dormant.mp3",
    "./transmissions/drifters_lore.mp3",
    "./transmissions/every_enemy.mp3",
    "./transmissions/fun_fact.mp3",
    "./transmissions/good_news.mp3",
    "./transmissions/lore_collection.mp3",
    "./transmissions/lore_machines.mp3",
    "./transmissions/lore_sector.mp3",
    "./transmissions/mass_lore.mp3",
    "./transmissions/morele_report.mp3",
    "./transmissions/obelisk.mp3",
    "./transmissions/orbiters_lore.mp3",
    "./transmissions/phantoms_lore.mp3",
    "./transmissions/quarantine.mp3",
    "./transmissions/quiet_war.mp3",
    "./transmissions/remember_your_training.mp3",
    "./transmissions/sentinel_core.mp3",
    "./transmissions/splitters_lore.mp3",
    "./transmissions/survival_odds.mp3",
    "./transmissions/swarm_core.mp3",
    "./transmissions/the_coms_are_on.mp3",
    "./transmissions/watchers_lore.mp3",
    "./transmissions/your-at_5.mp3"
];

const DEFAULT_MANIFEST = {
    general: GENERAL_TRANSMISSIONS,
    health: {
        warning: [
            "./transmissions/health/warning/duct_tape.mp3",
            "./transmissions/health/warning/hull_integrity.mp3",
            "./transmissions/health/warning/kill_count.mp3",
            "./transmissions/health/warning/leaking_atmosphere.mp3",
            "./transmissions/health/warning/low_hp.mp3",
            "./transmissions/health/warning/most_expensive.mp3"
        ],
        critical: [
            "./transmissions/health/critical/callsign.mp3",
            "./transmissions/health/critical/life_insurance.mp3",
            "./transmissions/health/critical/memorial.mp3"
        ]
    },
    enemies: {
        drifter: [
            "./transmissions/enemies/drifter/drifters_cargo_drones.mp3",
            "./transmissions/enemies/drifter/drifters_die_easy.mp3",
            "./transmissions/enemies/drifter/drifters_elite.mp3",
            "./transmissions/enemies/drifter/drifters_mindless_husks.mp3",
            "./transmissions/enemies/drifter/drifters_no_weapons.mp3"
        ],
        watcher: [
            "./transmissions/enemies/watcher/watchers_decent_shots.mp3",
            "./transmissions/enemies/watcher/watchers_elite.mp3",
            "./transmissions/enemies/watcher/watchers_eye_looking.mp3",
            "./transmissions/enemies/watcher/watchers_plink.mp3",
            "./transmissions/enemies/watcher/watchers_shoot_back.mp3"
        ],
        mass: [
            "./transmissions/enemies/mass/mass_brick_wall.mp3",
            "./transmissions/enemies/mass/mass_elite.mp3",
            "./transmissions/enemies/mass/mass_respect_the_hustle.mp3",
            "./transmissions/enemies/mass/mass_sick_armor.mp3",
            "./transmissions/enemies/mass/mass_tanks.mp3"
        ],
        phantom: [
            "./transmissions/enemies/phantom/phantoms_ghosts.mp3",
            "./transmissions/enemies/phantom/phantoms_on_scope.mp3",
            "./transmissions/enemies/phantom/phantoms_phase.mp3",
            "./transmissions/enemies/phantom/phantoms_ramming.mp3",
            "./transmissions/enemies/phantom/phantoms_transparent.mp3"
        ],
        orbiter: [
            "./transmissions/enemies/orbiter/orbiters_creative.mp3",
            "./transmissions/enemies/orbiter/orbiters_flank.mp3",
            "./transmissions/enemies/orbiter/orbiters_never_fly_straight.mp3",
            "./transmissions/enemies/orbiter/orbiters_rapidfire.mp3",
            "./transmissions/enemies/orbiter/orbiters_vultures.mp3"
        ],
        splitter: [
            "./transmissions/enemies/splitter/splitters_approaching.mp3",
            "./transmissions/enemies/splitter/splitters_deal.mp3",
            "./transmissions/enemies/splitter/splitters_detected.mp3",
            "./transmissions/enemies/splitter/splitters_evolution.mp3",
            "./transmissions/enemies/splitter/splitters_family_reunion.mp3"
        ],
        elite: [
            "./transmissions/enemies/elite/elite-1.mp3",
            "./transmissions/enemies/elite/elite-2.mp3",
            "./transmissions/enemies/elite/elite-3.mp3",
            "./transmissions/enemies/elite/elite-4.mp3",
            "./transmissions/enemies/elite/elite-5.mp3"
        ]
    },
    upgrades: {
        weapons: [
            "./transmissions/upgrades/powershot.mp3",
            "./transmissions/upgrades/rapid_fire.mp3",
            "./transmissions/upgrades/heat_seaker.mp3",
            "./transmissions/upgrades/heavy_barrel.mp3",
            "./transmissions/upgrades/rebound.mp3",
            "./transmissions/upgrades/split_shot.mp3",
            "./transmissions/upgrades/piercing_round.mp3",
            "./transmissions/upgrades/chain_arc.mp3",
            "./transmissions/upgrades/explosive_impact.mp3",
            "./transmissions/upgrades/side_cart.mp3"
        ],
        defense: [
            "./transmissions/upgrades/lite_plating.mp3",
            "./transmissions/upgrades/xp_shield.mp3",
            "./transmissions/upgrades/stabilizers.mp3",
            "./transmissions/upgrades/kinetic_syphon.mp3",
            "./transmissions/upgrades/neutron_core.mp3"
        ],
        utility: [
            "./transmissions/upgrades/engine_tune.mp3",
            "./transmissions/upgrades/magnet_coil.mp3",
            "./transmissions/upgrades/dash_sparks.mp3",
            "./transmissions/upgrades/momentum_feed.mp3",
            "./transmissions/upgrades/quantum_tunneling.mp3"
        ],
        legendary: [
            "./transmissions/upgrades/glass_canon.mp3",
            "./transmissions/upgrades/singularity_round.mp3",
            "./transmissions/upgrades/bullet_hell.mp3",
            "./transmissions/upgrades/blood_fuel.mp3",
            "./transmissions/upgrades/berserk_Module.mp3"
        ]
    },
    bosses: {
        sentinel: [
            "./transmissions/bosses/sentinel-core/sentinel_approaching.mp3",
            "./transmissions/bosses/sentinel-core/sentinel_core_approach.mp3",
            "./transmissions/bosses/sentinel-core/sentinel_core_detected.mp3",
            "./transmissions/bosses/sentinel-core/sentinel_core_lasers.mp3",
            "./transmissions/bosses/sentinel-core/sentinel_incoming.mp3"
        ],
        "swarm-core": [
            "./transmissions/bosses/swarm-core/swarm_core_approaching.mp3",
            "./transmissions/bosses/swarm-core/swarm_core_detected.mp3",
            "./transmissions/bosses/swarm-core/swarm_core_friends.mp3",
            "./transmissions/bosses/swarm-core/swarm_core_incoming.mp3",
            "./transmissions/bosses/swarm-core/swarm_core_on_radar.mp3"
        ],
        obelisk: [
            "./transmissions/bosses/obelisk/obalisk_aproaching.mp3",
            "./transmissions/bosses/obelisk/obelisk_detected.mp3",
            "./transmissions/bosses/obelisk/obelisk_detected_2.mp3",
            "./transmissions/bosses/obelisk/obelisk_incoming.mp3",
            "./transmissions/bosses/obelisk/obelisk_on_scope.mp3"
        ]
    },
    wave: {
        intermission: [
            "./transmissions/wave/intermission/area_secure.mp3",
            "./transmissions/wave/intermission/artistic.mp3",
            "./transmissions/wave/intermission/doing_great.mp3",
            "./transmissions/wave/intermission/finesh_thejob.mp3",
            "./transmissions/wave/intermission/fun.mp3",
            "./transmissions/wave/intermission/hostile_eliminated.mp3",
            "./transmissions/wave/intermission/incoming_wave.mp3",
            "./transmissions/wave/intermission/midcombat.mp3",
            "./transmissions/wave/intermission/new_wave.mp3",
            "./transmissions/wave/intermission/nice_work.mp3",
            "./transmissions/wave/intermission/wave_clear.mp3",
            "./transmissions/wave/intermission/wave_detected.mp3",
            "./transmissions/wave/intermission/wave_down.mp3"
        ]
    }
};

const UPGRADE_CATEGORY_TO_POOL = {
    offense: "weapons",
    defense: "defense",
    utility: "utility",
    legendary: "legendary"
};

function cloneManifest(manifest) {
    return JSON.parse(JSON.stringify(manifest));
}

function mergeManifest(manifest) {
    const merged = cloneManifest(DEFAULT_MANIFEST);
    if (Array.isArray(manifest?.general) && manifest.general.length) {
        merged.general = manifest.general;
    }
    for (const section of ["health", "enemies", "upgrades", "bosses", "wave"]) {
        if (!manifest?.[section]) continue;
        merged[section] = merged[section] ?? {};
        for (const [key, value] of Object.entries(manifest[section])) {
            if (Array.isArray(value) && value.length) {
                merged[section][key] = value;
            }
        }
    }
    return merged;
}

export {
    DEFAULT_MANIFEST,
    GENERAL_TRANSMISSIONS,
    UPGRADE_CATEGORY_TO_POOL,
    cloneManifest,
    mergeManifest
};

/**
 * LeaderboardService - Handles score submission and leaderboard fetching.
 * Uses Supabase for backend with HMAC anti-cheat validation.
 */
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

// HMAC secret for score signing (shared with edge function)
// In production, this should be more carefully managed
const HMAC_SECRET = "qq-leaderboard-2026-v1";

/**
 * Generate HMAC-SHA256 checksum for score validation.
 * @param {string} payload - The data string to sign
 * @returns {Promise<string>} Base64-encoded signature
 */
async function generateChecksum(payload) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(HMAC_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(payload)
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Calculate score from run stats.
 * Enhanced formula with multiple differentiation factors:
 * - Wave progression (base points)
 * - Kill points with 3x elite multiplier
 * - Time bonus for fast clears
 * - Survival bonus for remaining health
 * - Flawless bonus for no-hit runs
 * @param {Object} runStats
 * @returns {number}
 */
export function calculateScore(runStats) {
    const wave = runStats.wave ?? 0;
    const kills = runStats.kills ?? 0;
    const eliteKills = runStats.eliteKills ?? 0;
    const damageDealt = runStats.damageDealt ?? 0;
    const duration = runStats.duration ?? 0; // in seconds
    const victory = runStats.victory ?? false;
    const bossDefeated = runStats.bossDefeated ?? false;
    const damageTaken = runStats.damageTaken ?? 0;
    const maxHealth = runStats.maxHealth ?? 100;
    const endHealth = runStats.endHealth ?? 0;

    // Base points from waves
    const wavePoints = wave * 1000;

    // Kill points with elite multiplier (3x for elites)
    const normalKillPoints = (kills - eliteKills) * 10;
    const eliteKillPoints = eliteKills * 30;

    // Damage efficiency (capped at 500)
    const damagePoints = Math.min(500, damageDealt / 20);

    // Time bonus: faster clears earn more (max 3000 points at <2min victory)
    // Decays linearly - penalty kicks in after 3 minutes
    const timeBonus = victory
        ? Math.max(0, Math.floor(3000 - duration * 8))
        : 0;

    // Victory bonus
    const victoryBonus = victory ? 5000 : 0;

    // Boss defeat bonus
    const bossBonus = bossDefeated ? 2000 : 0;

    // Survival bonus: % of health remaining (up to 1000)
    const healthRatio = maxHealth > 0 ? endHealth / maxHealth : 0;
    const survivalBonus = victory ? Math.floor(healthRatio * 1000) : 0;

    // Flawless bonus (no damage taken)
    const flawlessBonus = damageTaken === 0 && victory ? 2000 : 0;

    return Math.floor(
        wavePoints +
        normalKillPoints +
        eliteKillPoints +
        damagePoints +
        timeBonus +
        victoryBonus +
        bossBonus +
        survivalBonus +
        flawlessBonus
    );
}

/**
 * Submit a score to the leaderboard.
 * @param {Object} params
 * @param {string} params.playerName - Player's display name
 * @param {Object} params.runStats - Run statistics from the game
 * @param {string} [params.weeklySeed] - Weekly challenge seed
 * @param {string} [params.affixId] - Active affix ID
 * @returns {Promise<{success: boolean, error?: string, id?: string}>}
 */
export async function submitScore({
    playerName,
    runStats,
    weeklySeed,
    affixId,
}) {
    if (!isSupabaseConfigured()) {
        console.warn("[LeaderboardService] Supabase not configured");
        return { success: false, error: "Leaderboard not available" };
    }

    if (!playerName || !playerName.trim()) {
        return { success: false, error: "Player name required" };
    }

    const score = calculateScore(runStats);
    const wave = runStats.wave ?? 0;
    const duration = Math.floor(runStats.duration ?? 0);
    const kills = runStats.kills ?? 0;
    const victory = runStats.victory ?? false;
    const timestamp = Date.now();

    // Build payload for checksum
    const payload = `${playerName}:${score}:${wave}:${duration}:${kills}:${victory}:${weeklySeed || ""}:${affixId || ""}:${timestamp}`;
    const checksum = await generateChecksum(payload);

    try {
        const response = await supabase.functions.invoke("submit-score", {
            body: {
                playerName: playerName.trim().slice(0, 20),
                score,
                wave,
                duration,
                kills,
                victory,
                weeklySeed: weeklySeed || null,
                affixId: affixId || null,
                checksum,
                timestamp,
            },
        });

        if (response.error) {
            console.error("[LeaderboardService] Submit error:", response.error);
            return {
                success: false,
                error: response.error.message || "Submission failed",
            };
        }

        return { success: true, id: response.data?.id };
    } catch (err) {
        console.error("[LeaderboardService] Submit exception:", err);
        return { success: false, error: "Network error" };
    }
}

/**
 * Fetch top all-time scores.
 * @param {number} limit - Number of scores to fetch
 * @returns {Promise<{data: Array, error?: string}>}
 */
export async function fetchAllTimeTop(limit = 50) {
    if (!isSupabaseConfigured()) {
        return { data: [], error: "Leaderboard not available" };
    }

    try {
        const { data, error } = await supabase
            .from("scores")
            .select("id, player_name, score, wave, duration, kills, victory, created_at")
            .order("score", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("[LeaderboardService] Fetch all-time error:", error);
            return { data: [], error: error.message };
        }

        return { data: data || [] };
    } catch (err) {
        console.error("[LeaderboardService] Fetch all-time exception:", err);
        return { data: [], error: "Network error" };
    }
}

/**
 * Fetch top weekly scores for a specific weekly seed.
 * @param {string} weeklySeed - The weekly challenge seed
 * @param {number} limit - Number of scores to fetch
 * @returns {Promise<{data: Array, error?: string}>}
 */
export async function fetchWeeklyTop(weeklySeed, limit = 50) {
    if (!isSupabaseConfigured()) {
        return { data: [], error: "Leaderboard not available" };
    }

    if (!weeklySeed) {
        return { data: [], error: "Weekly seed required" };
    }

    try {
        const { data, error } = await supabase
            .from("scores")
            .select("id, player_name, score, wave, duration, kills, victory, created_at")
            .eq("weekly_seed", String(weeklySeed))
            .order("score", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("[LeaderboardService] Fetch weekly error:", error);
            return { data: [], error: error.message };
        }

        return { data: data || [] };
    } catch (err) {
        console.error("[LeaderboardService] Fetch weekly exception:", err);
        return { data: [], error: "Network error" };
    }
}

/**
 * Fetch player's personal best scores.
 * @param {string} playerName
 * @param {number} limit
 * @returns {Promise<{data: Array, error?: string}>}
 */
export async function fetchPlayerBest(playerName, limit = 10) {
    if (!isSupabaseConfigured()) {
        return { data: [], error: "Leaderboard not available" };
    }

    try {
        const { data, error } = await supabase
            .from("scores")
            .select("id, player_name, score, wave, duration, kills, victory, created_at, weekly_seed")
            .eq("player_name", playerName)
            .order("score", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("[LeaderboardService] Fetch player error:", error);
            return { data: [], error: error.message };
        }

        return { data: data || [] };
    } catch (err) {
        console.error("[LeaderboardService] Fetch player exception:", err);
        return { data: [], error: "Network error" };
    }
}

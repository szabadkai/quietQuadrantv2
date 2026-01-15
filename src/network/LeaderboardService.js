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
 * Formula: (wave * 1000) + (kills * 10) + (damage / 10) + victory bonus
 * @param {Object} runStats
 * @returns {number}
 */
export function calculateScore(runStats) {
    const wave = runStats.wave ?? 0;
    const kills = runStats.kills ?? 0;
    const damageDealt = runStats.damageDealt ?? 0;
    const victory = runStats.victory ?? false;

    return Math.floor(
        wave * 1000 + kills * 10 + damageDealt / 10 + (victory ? 5000 : 0)
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

/**
 * Supabase client configuration for the leaderboard system.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client instance. Will be null if not configured.
 */
export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

/**
 * Check if Supabase is properly configured.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
    return supabase !== null;
}

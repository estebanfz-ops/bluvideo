/**
 * supabase.js — BluVideo OS Supabase client
 *
 * Env vars are injected at runtime via window.__env__ (set by a <script> tag
 * rendered by Vercel's edge config or a small server-side snippet in index.html).
 * This keeps secrets out of the JS bundle while still working with a static host.
 *
 * Expected window.__env__ shape (set before this script loads):
 *   window.__env__ = {
 *     SUPABASE_URL: "https://xxxx.supabase.co",
 *     SUPABASE_ANON_KEY: "eyJ..."
 *   };
 *
 * Usage:
 *   import { supabase, signIn, signOut, getUser } from './lib/supabase.js';
 *   // OR in a plain <script> context:
 *   const { supabase, signIn, signOut, getUser } = window.BluvideoSupabase;
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ---------------------------------------------------------------------------
// Bootstrap env
// ---------------------------------------------------------------------------

const env = window.__env__ || {};

const SUPABASE_URL     = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[BluVideo] Supabase env vars missing. ' +
    'Make sure window.__env__.SUPABASE_URL and window.__env__.SUPABASE_ANON_KEY ' +
    'are set before this script loads.'
  );
}

// ---------------------------------------------------------------------------
// Client instance (singleton)
// ---------------------------------------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage so the user stays logged in across tabs/refreshes
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Sign in with email + password.
 * Returns { data: { user, session }, error }.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: object, error: object|null }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/**
 * Sign the current user out and clear the local session.
 * Returns { error }.
 *
 * @returns {Promise<{ error: object|null }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the currently authenticated user from the active session.
 * Returns null if no session exists.
 *
 * @returns {Promise<import('@supabase/supabase-js').User|null>}
 */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.).
 * Returns the Supabase subscription object — call .unsubscribe() to clean up.
 *
 * @param {(event: string, session: object|null) => void} callback
 * @returns {{ data: { subscription: object } }}
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ---------------------------------------------------------------------------
// Expose on window for plain <script> usage (non-module contexts)
// ---------------------------------------------------------------------------

window.BluvideoSupabase = {
  supabase,
  signIn,
  signOut,
  getUser,
  onAuthStateChange,
};

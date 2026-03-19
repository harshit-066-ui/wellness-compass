import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // 🔥 HARD FAIL if missing (prevents silent crashes later)
  if (!url || !key) {
    console.error('❌ Supabase ENV missing');
    return null;
  }

  try {
    supabase = createClient(url, key);
    console.log('✅ Supabase initialized');
    return supabase;
  } catch (err) {
    console.error('❌ Supabase init failed:', err.message);
    return null;
  }
}

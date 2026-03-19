import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (url && key && url !== 'your_supabase_project_url' && url.startsWith('http')) {
      supabase = createClient(url, key);
    }
  }
  return supabase;
}

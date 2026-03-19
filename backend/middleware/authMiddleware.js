import { getSupabase } from '../utils/supabase.js';

export const authMiddleware = async (req, res, next) => {
  // ✅ CRITICAL FIX: allow preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const anonymousId = req.headers['x-anonymous-id'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabase();

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = {
    id: data.user.id,
    email: data.user.email
  };

  // ── DATA MIGRATION LOGIC ──────────────────────────────────────────────────
  if (anonymousId) {
    try {
      const tables = ['survey_results', 'plans', 'habits', 'messages'];

      for (const table of tables) {
        const { error: updateError } = await supabase
          .from(table)
          .update({ user_id: req.user.id })
          .eq('anonymous_id', anonymousId)
          .is('user_id', null);

        if (updateError) {
          console.warn(`[Migration] Failed to migrate table ${table}:`, updateError.message);
        }
      }
    } catch (err) {
      console.error('[Migration] Error during data migration:', err.message);
    }
  }

  next();
};

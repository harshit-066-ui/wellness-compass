import { getSupabase } from '../utils/supabase.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabase();

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not initialized' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email
    };

    next();
  } catch (err) {
    console.error('❌ AUTH ERROR:', err);
    return res.status(500).json({ error: 'Auth middleware failed' });
  }
};

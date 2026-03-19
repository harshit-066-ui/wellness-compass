import { getSupabase } from '../utils/supabase.js';

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.habits)) return value.habits;
  return [];
}

// GET /api/habits
export async function getHabits(req, res) {
  try {
    const guestId = req.guestId;
    const db = getSupabase();
    if (!db) return res.json({ habits: [] });

    const { data, error } = await db
      .from('habits')
      .select('*')
      .or(`user_id.eq.${req.user.id},and(anonymous_id.eq.${req.guestId},user_id.is.null)`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    const safeHabits = normalizeArray(data);
    console.log(`[getHabits] Sending response with ${safeHabits.length} habits.`);
    res.json({ habits: safeHabits });
  } catch (err) {
    console.error('[getHabits]', err.message);
    res.status(500).json({ habits: [] });
  }
}

// PATCH /api/habits/:id
export async function updateHabit(req, res) {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const db = getSupabase();

    if (!db) return res.json({ success: true });

    const { data, error } = await db
      .from('habits')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .or(`user_id.eq.${req.user.id},and(anonymous_id.eq.${req.guestId},user_id.is.null)`)
      .select()
      .single();

    if (error) throw error;
    res.json({ habit: data });
  } catch (err) {
    console.error('[updateHabit]', err.message);
    res.status(500).json({ error: 'Failed to update habit' });
  }
}

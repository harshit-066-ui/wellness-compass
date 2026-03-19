import { getSupabase } from '../utils/supabase.js';

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.habits)) return value.habits;
  return [];
}

// GET /api/analytics
export async function getAnalytics(req, res) {
  try {
    const guestId = req.guestId;
    const db = getSupabase();

    if (!db) {
      return res.json({
        results: [],
        summary: { totalAssessments: 0, oecdAvg: null, permaAvg: null },
      });
    }

    const { data, error } = await db
      .from('survey_results')
      .select('*')
      .or(`user_id.eq.${req.user.id},and(anonymous_id.eq.${req.guestId},user_id.is.null)`)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;
    const results = normalizeArray(data);

    const calcAvg = (scores) => {
      if (!scores) return null;
      const vals = Object.values(scores).map(Number).filter(Boolean);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null;
    };

    const summary = {
      totalAssessments: results?.length || 0,
      oecdAvg: results?.length ? calcAvg(results[results.length - 1]?.oecd_scores) : null,
      permaAvg: results?.length ? calcAvg(results[results.length - 1]?.perma_scores) : null,
    };

    console.log(`[getAnalytics] Sending response with ${results.length} results.`);
    res.json({ results, summary });
  } catch (err) {
    console.error('[getAnalytics]', err.message);
    res.status(500).json({ results: [], summary: {} });
  }
}

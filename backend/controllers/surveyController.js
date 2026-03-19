import { getSupabase } from '../utils/supabase.js';

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.habits)) return value.habits;
  return [];
}

// POST /api/survey
export async function submitSurvey(req, res) {
  try {
    const { type, scores } = req.body;
    const userId = req.user.id;
    const guestId = req.guestId;

    if (!type || !scores) return res.status(400).json({ error: 'type and scores are required' });

    const db = getSupabase();
    if (db) {
      // Check 24-hour restriction
      const { data: latestData } = await db
        .from('survey_results')
        .select('created_at')
        .or(`user_id.eq.${userId},and(anonymous_id.eq.${guestId},user_id.is.null)`)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestData && latestData.length > 0) {
        const lastSubmission = new Date(latestData[0].created_at);
        const currentTime = new Date();
        if (currentTime - lastSubmission < 24 * 60 * 60 * 1000) {
          return res.status(429).json({ error: 'You can take this assessment once per day. Please return tomorrow.' });
        }
      }
      // Fetch latest row to merge scores
      const { data: previousLatest } = await db
        .from('survey_results')
        .select('oecd_scores, perma_scores, scores')
        .or(`user_id.eq.${userId},and(anonymous_id.eq.${guestId},user_id.is.null)`)
        .order('created_at', { ascending: false })
        .limit(1);

      const latest = previousLatest?.[0] || {};
      const mergedOECD = type === 'oecd' ? scores : (latest.oecd_scores || latest.scores?.oecd || {});
      const mergedPERMA = type === 'perma' ? scores : (latest.perma_scores || latest.scores?.perma || {});

      const payload = {
        user_id: userId,
        anonymous_id: guestId,
        type,
        oecd_scores: mergedOECD,
        perma_scores: mergedPERMA,
        scores: { oecd: mergedOECD, perma: mergedPERMA },
        created_at: new Date().toISOString(),
      };
      const { error } = await db.from('survey_results').insert(payload);
      if (error) console.warn('[Supabase survey insert]', error.message);
    }

    res.json({ success: true, type, scores });
  } catch (err) {
    console.error('[submitSurvey]', err.message);
    res.status(500).json({ error: 'Failed to save survey' });
  }
}

// GET /api/survey/history
export async function getSurveyHistory(req, res) {
  try {
    const guestId = req.guestId;
    const db = getSupabase();

    if (!db) {
      return res.json({ results: [] });
    }

    const { data, error } = await db
      .from('survey_results')
      .select('*')
      .or(`user_id.eq.${req.user.id},and(anonymous_id.eq.${req.guestId},user_id.is.null)`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);
    const safeResults = normalizeArray(data);
    console.log(`[getSurveyHistory] Sending response with ${safeResults.length} results.`);
    res.json({ results: safeResults });
  } catch (err) {
    console.error('[getSurveyHistory]', err.message);
    res.status(500).json({ results: [] });
  }
}

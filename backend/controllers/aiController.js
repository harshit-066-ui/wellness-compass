import { buildChatPrompt, buildHabitPlanPrompt } from '../utils/promptBuilder.js';
import { extractJson } from '../utils/regexParser.js';
import { getFallbackPlan } from '../utils/fallbackPlans.js';
import { getSupabase } from '../utils/supabase.js';
import { callWithFallback } from '../services/aiService.js';

const FALLBACK_REPLY = "I'm here to support your wellbeing journey! Based on scientific research, small daily habits create the biggest long-term changes. Try starting with just 2 minutes of mindful breathing each morning — tiny, consistent actions compound over time.";

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.habits)) return value.habits;
  if (Array.isArray(value?.history)) return value.history;
  return [];
}

// POST /api/ai/chat
export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user.id;
    const guestId = req.guestId;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const db = getSupabase();
    const oecd = req.body?.oecd_scores || {};
    const perma = req.body?.perma_scores || {};
    let surveyResults = { oecd_scores: oecd, perma_scores: perma };

    if (db) {
      const { data, error } = await db
        .from('survey_results')
        .select('oecd_scores, perma_scores')
        .or(`user_id.eq.${userId},and(anonymous_id.eq.${guestId},user_id.is.null)`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data?.length > 0) {
        if (Object.keys(oecd).length === 0 && data[0].oecd_scores) surveyResults.oecd_scores = data[0].oecd_scores;
        if (Object.keys(perma).length === 0 && data[0].perma_scores) surveyResults.perma_scores = data[0].perma_scores;
      }
    }

    const messages = buildChatPrompt(message, history, surveyResults);
    const content = await callWithFallback(messages);
    let reply = content || FALLBACK_REPLY;

    // Safety net: Check for partial response
    if (content && !content.trim().match(/[.!?]$/)) {
      reply += "\n\n*(Partial response detected — type 'continue' if needed)*";
    }

    if (db) {
      // Save User Message
      await db.from('messages').insert({ user_id: userId, anonymous_id: guestId, role: 'user', content: message });
      // Save AI Message
      await db.from('messages').insert({ user_id: userId, anonymous_id: guestId, role: 'assistant', content: reply });
    }

    res.json({ response: reply, reply });
  } catch (err) {
    console.error('[AI chat]', err.message);
    res.status(500).json({ response: FALLBACK_REPLY, reply: FALLBACK_REPLY, error: err.message });
  }
}

// GET /api/ai/history
export async function getChatHistory(req, res) {
  try {
    const guestId = req.guestId;
    const db = getSupabase();
    if (!db) return res.json({ history: [] });

    const { data, error } = await db
      .from('messages')
      .select('*')
      .or(`user_id.eq.${req.user.id},and(anonymous_id.eq.${req.guestId},user_id.is.null)`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    const history = normalizeArray(data);
    console.log(`[getChatHistory] Sending response with ${history.length} messages.`);
    res.json({ history });
  } catch (err) {
    console.error('[getChatHistory]', err.message);
    res.status(500).json({ history: [] });
  }
}

// POST /api/ai/plan
export async function generatePlan(req, res) {
  try {
    const oecd = req.body?.oecd_scores || {};
    const perma = req.body?.perma_scores || {};
    const guestId = req.guestId;
    const messages = buildHabitPlanPrompt({ oecd_scores: oecd, perma_scores: perma });
    const content = await callWithFallback(messages);
    const parsed = content ? extractJson(content) : null;
    const plan = parsed || getFallbackPlan({ oecd_scores: oecd, perma_scores: perma });

    const db = getSupabase();
    if (db) {
      // Save Plan
      const { data: planRow, error: planError } = await db
        .from('plans')
        .insert({ user_id: req.user.id, anonymous_id: req.guestId, plan })
        .select()
        .single();

      if (!planError && planRow) {
        // Spread habits into habits table for tracking
        const habitRows = Object.entries(plan).flatMap(([day, habits]) => {
          const acts = Array.isArray(habits) ? habits : [habits];
          return acts.map(h => ({
            user_id: req.user.id,
            anonymous_id: req.guestId,
            plan_id: planRow.id,
            day,
            habit_text: h,
            completed: false
          }));
        });
        await db.from('habits').insert(habitRows);
      }
    }

    console.log('[AI plan] Sending response with plan keys:', Object.keys(plan));
    res.json({ plan });
  } catch (err) {
    console.error('[AI plan]', err.message);
    const oecd = req.body?.oecd_scores || {};
    const perma = req.body?.perma_scores || {};
    const fallback = getFallbackPlan({ oecd_scores: oecd, perma_scores: perma });
    console.log('[AI plan] Sending fallback response with plan keys:', Object.keys(fallback));
    res.json({ plan: fallback });
  }
}

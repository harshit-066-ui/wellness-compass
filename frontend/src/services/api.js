import axios from 'axios';
import { supabase } from './supabaseClient';

// Use env variable if available, otherwise fallback to local API
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';


const http = axios.create({
  baseURL: API_BASE
});

// Attach authenticated session
http.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});


// ── Surveys ─────────────────────────────────────────────────────

export async function submitSurvey(type, scores) {
  const { data } = await http.post('/survey', { type, scores });
  return data;
}

export async function getSurveyHistory() {
  const { data } = await http.get('/survey/history');
  return data;
}


// ── AI Coach ────────────────────────────────────────────────────

export async function sendChatMessage(
  message,
  history = [],
  oecd_scores = {},
  perma_scores = {}
) {
  const { data } = await http.post('/ai/chat', {
    message,
    history,
    oecd_scores,
    perma_scores
  });

  return data;
}

export async function getChatHistory() {
  const { data } = await http.get('/ai/history');
  return data;
}


// ── Habit Plan ──────────────────────────────────────────────────

export async function generateHabitPlan(
  oecd_scores = {},
  perma_scores = {}
) {
  const { data } = await http.post('/ai/plan', {
    oecd_scores,
    perma_scores
  });

  return data;
}


// ── Analytics ───────────────────────────────────────────────────

export async function getAnalytics() {
  const { data } = await http.get('/analytics');
  return data;
}


// ── Habits ──────────────────────────────────────────────────────

export async function getHabits() {
  const { data } = await http.get('/habits');
  return data;
}

export async function updateHabit(habitId, completed) {
  const { data } = await http.patch(`/habits/${habitId}`, {
    completed
  });

  return data;
}

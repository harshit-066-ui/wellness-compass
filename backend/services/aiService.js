import axios from 'axios';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const PREFERRED_MODEL = 'stepfun/step-3.5-flash:free';
const FALLBACK_MODEL = 'arcee-ai/trinity-large-preview:free';
const ULTIMATE_FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

export async function callOpenRouter(messages, model) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const response = await axios.post(
    `${OPENROUTER_BASE}/chat/completions`,
    { 
      model, 
      messages, 
      max_tokens: 1800,
      temperature: 0.7,
      top_p: 0.95
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Wellness Compass',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const choice = response.data?.choices?.[0];
  let content = choice?.message?.content?.trim() || '';

  if (choice?.finish_reason === 'length') {
    console.warn(`[OpenRouter] Truncated: finish_reason=length, model=${model}, tokens_used=${choice?.usage?.completion_tokens || 'unknown'}`);
    content += "\n\n*(Response reached length limit — reply 'continue' for more or ask for shorter version)*";
  }

  return content;
}

export async function callWithFallback(messages) {
  for (const model of [PREFERRED_MODEL, FALLBACK_MODEL, ULTIMATE_FALLBACK_MODEL]) {
    try {
      const content = await callOpenRouter(messages, model);
      if (content) return content;
    } catch (err) {
      console.warn(`[callWithFallback] Model ${model} failed:`, err.message);
      continue;
    }
  }
  return null;
}

export function buildChatPrompt(message, history = [], surveyResults = null) {
  let contextInfo = 'User has not completed any assessments yet — encourage them to try from the dashboard.';
  let lowestInfo = '';

  const hasData = surveyResults && (Object.keys(surveyResults.oecd_scores || {}).length > 0 || Object.keys(surveyResults.perma_scores || {}).length > 0);

  if (hasData) {
    const oecd = surveyResults.oecd_scores || {};
    const perma = surveyResults.perma_scores || {};

    const getLowest = (scores, count = 2) => {
      return Object.entries(scores)
        .sort((a, b) => a[1] - b[1])
        .slice(0, count)
        .map(([key]) => key);
    };

    let contextLines = ["User's latest wellbeing data:"];
    let lowestLines = ["Priority areas for improvement:"];

    if (Object.keys(oecd).length > 0) {
      const lowestOECD = getLowest(oecd);
      contextLines.push(`OECD (life conditions and structural wellbeing): ${JSON.stringify(oecd)}`);
      lowestLines.push(`- Lowest OECD: ${lowestOECD.join(', ')}`);
    }

    if (Object.keys(perma).length > 0) {
      const lowestPERMA = getLowest(perma);
      contextLines.push(`PERMA (psychological wellbeing): ${JSON.stringify(perma)}`);
      lowestLines.push(`- Lowest PERMA: ${lowestPERMA.join(', ')}`);
    }

    contextInfo = contextLines.join('\n');
    lowestInfo = lowestLines.join('\n');
  }

  const systemContent = [
    'You are a compassionate, concise AI Wellness Coach. Always respond in clean, well-formatted markdown.',
    'Use proper markdown syntax: ## for headings, **bold** for emphasis, • or - for bullets, never raw asterisks or hashes in prose.',
    'Be warm and encouraging. Keep explanations short: 1–2 sentences max per habit in "Why This Helps".',
    'You MUST complete every section fully. Never stop mid-sentence or mid-explanation.',
    'Output ONLY the markdown — no extra commentary, no json, no code fences around the whole response.',
    'You specialize in wellbeing based on the OECD Better Life Index and PERMA model.',
    '',
    hasData ? `
CONTEXT:
${contextInfo}
${lowestInfo}

REQUIRED FORMAT:
## Quick Insight
1–2 sentences referencing the user's current state and lowest scores.

## What Your Scores Suggest
• Bullet point list of the lowest OECD domains and PERMA pillars.

## Tiny Habit Suggestions
• List 3 tiny, actionable habits (< 5 mins) targeting the lowest domains.

## Why This Helps
Short explanation of how these habits boost specific PERMA pillars and OECD dimensions.
` : `
## Quick Insight
You have not completed a wellbeing assessment yet.

## Next Step
Please complete the OECD or PERMA assessment from the dashboard so I can provide personalized advice.
`
  ].join('\n');

  const messages = [
    { role: 'system', content: systemContent },
    ...history.slice(-10),
    { role: 'user', content: message },
  ];

  return messages;
}

export function buildHabitPlanPrompt(scores) {
  const oecd = scores?.oecd || scores?.oecd_scores || {};
  const perma = scores?.perma || scores?.perma_scores || {};

  const getLowest = (s, count = 2) => Object.entries(s || {})
    .sort((a, b) => a[1] - b[1]).slice(0, count).map(([k]) => k);

  const contextLines = [];
  if (Object.keys(oecd).length > 0) {
    const lowestOECD = getLowest(oecd);
    contextLines.push(`Primary focus areas (lowest OECD): ${lowestOECD.join(', ')}`);
  }
  if (Object.keys(perma).length > 0) {
    const lowestPERMA = getLowest(perma);
    contextLines.push(`Secondary focus areas (lowest PERMA): ${lowestPERMA.join(', ')}`);
  }

  const contextStr = contextLines.join('\n');

  return [
    {
      role: 'system',
      content: [
        'You are a wellbeing coach creating a 7-day Tiny Habits plan.',
        'Each day MUST contain exactly 4 short, actionable tasks.',
        'Target the tasks toward improving the user\'s specific weak areas provided.',
        'Follow the Tiny Habits methodology: each habit should take < 5 minutes.',
        'Return ONLY a valid JSON object with this exact shape (no markdown, no quotes around the json block):',
        '{ "day1": ["task1", "task2", "task3", "task4"], "day2": [...], ..., "day7": [...] }',
      ].join('\n'),
    },
    {
      role: 'user',
      content: `My wellbeing focus areas:\n${contextStr}\n\nGenerate my personalized 7-day habit plan with 4 tasks per day.`,
    },
  ];
}

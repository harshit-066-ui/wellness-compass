const FALLBACK_PLANS = {
  default: {
    day1: ['Drink a glass of water right after waking up'],
    day2: ['Take a 5-minute mindful breathing break at noon'],
    day3: ['Write down 3 things you\'re grateful for tonight'],
    day4: ['Go for a 10-minute walk outside after lunch'],
    day5: ['Text or call one person you care about'],
    day6: ['Read a book or article for 15 minutes before bed'],
    day7: ['Reflect: write one positive thing that happened this week'],
  },
  lowHealth: {
    day1: ['Do 5 gentle stretches in the morning'],
    day2: ['Replace one snack with a fruit or vegetable'],
    day3: ['Walk for 10 minutes after dinner'],
    day4: ['Go to bed 30 minutes earlier tonight'],
    day5: ['Spend 5 minutes outside in natural light'],
    day6: ['Drink 8 glasses of water today'],
    day7: ['Schedule a check-up or health appointment'],
  },
  lowSocial: {
    day1: ['Send a genuine compliment to someone today'],
    day2: ['Join or initiate one group activity this week'],
    day3: ['Have a real conversation (not text) with a friend'],
    day4: ['Express appreciation to a coworker or family member'],
    day5: ['Volunteer for a micro-task in your community'],
    day6: ['Invite someone for coffee or a walk'],
    day7: ['Reflect: who in your life deserves more attention?'],
  },
};

export function getFallbackPlan(scores) {
  if (!scores) return FALLBACK_PLANS.default;
  const oecdVals = Object.values(scores.oecd || {}).map(Number);
  const permaVals = Object.values(scores.perma || {}).map(Number);
  const healthScore = scores.oecd?.health;
  const communityScore = scores.oecd?.community || scores.perma?.relationships;

  if (healthScore && Number(healthScore) < 5) return FALLBACK_PLANS.lowHealth;
  if (communityScore && Number(communityScore) < 5) return FALLBACK_PLANS.lowSocial;
  return FALLBACK_PLANS.default;
}

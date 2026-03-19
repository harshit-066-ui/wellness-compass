export const OECD_SCHEMA = {
  id: 'oecd',
  title: 'OECD Wellbeing Index',
  description: 'Measure your wellbeing across 11 life domains based on the OECD Better Life Index framework.',
  domains: [
    { id: 'health', label: 'Health', icon: '❤️', description: 'Over the past two weeks, how would you rate your overall physical and mental health, including sleep quality, energy levels, and stress management?' },
    { id: 'worklife', label: 'Work-Life Balance', icon: '⚖️', description: 'How satisfied are you with the balance between your work/study responsibilities and the time you have for rest, hobbies, and personal relationships?' },
    { id: 'income', label: 'Income & Wealth', icon: '💰', description: 'How secure do you feel about your financial situation, including your ability to pay for necessities, save money, and handle unexpected expenses?' },
    { id: 'jobs', label: 'Jobs & Earnings', icon: '💼', description: 'How satisfied are you with your job or daily work activities in terms of purpose, stability, income, and growth opportunities?' },
    { id: 'housing', label: 'Housing', icon: '🏠', description: 'How satisfied are you with your living environment including comfort, privacy, safety, and access to essential facilities?' },
    { id: 'environment', label: 'Environment', icon: '🌿', description: 'How satisfied are you with your surrounding environment such as clean air, noise levels, safety, and access to green spaces?' },
    { id: 'education', label: 'Education & Skills', icon: '📚', description: 'How satisfied are you with your opportunities to learn new skills, improve knowledge, and grow intellectually or professionally?' },
    { id: 'civic', label: 'Civic Engagement', icon: '🗳️', description: 'How connected do you feel to your community through participation, volunteering, or awareness of civic and social issues?' },
    { id: 'safety', label: 'Safety', icon: '🛡️', description: 'How safe do you feel in your daily life including your home, neighborhood, and while commuting?' },
    { id: 'community', label: 'Community', icon: '🤝', description: 'How strong is your support network including friends, family, or people you can rely on during difficult situations?' },
    { id: 'lifeSatisfaction', label: 'Life Satisfaction', icon: '✨', description: 'Overall, how satisfied are you with your life right now considering your goals, relationships, health, and daily experiences?' },
  ],
};

export const PERMA_SCHEMA = {
  id: 'perma',
  title: 'PERMA Wellbeing Model',
  description: 'Assess your wellbeing through Martin Seligman\'s five pillars of flourishing.',
  domains: [
    { id: 'positiveEmotion', label: 'Positive Emotion', icon: '😊', description: 'During the past week, how often did you experience positive emotions such as joy, gratitude, calmness, or hope?' },
    { id: 'engagement', label: 'Engagement', icon: '🎯', description: 'How often do you become deeply absorbed or focused in activities such as work, study, hobbies, or creative tasks?' },
    { id: 'relationships', label: 'Relationships', icon: '💞', description: 'How satisfied are you with the quality of your relationships including emotional support, trust, and meaningful communication?' },
    { id: 'meaning', label: 'Meaning', icon: '🌟', description: 'To what extent do you feel your life has purpose and direction beyond daily routines?' },
    { id: 'accomplishment', label: 'Accomplishment', icon: '🏆', description: 'How satisfied are you with the progress you are making toward personal goals and achievements that matter to you?' },
  ],
};

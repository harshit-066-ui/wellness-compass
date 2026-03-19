import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/GuestContext';
import { getSurveyHistory, generateHabitPlan, getHabits, updateHabit } from '../services/api';
import { GlassCard, LoadingSpinner, ErrorCard, ButtonGlow } from '../components/ui';
import { RadarOECD, BarPERMA, HabitCompletion } from '../components/charts';

const OECD_PRETTY = {
  health: 'Health', worklife: 'Work-Life', income: 'Income', jobs: 'Jobs',
  housing: 'Housing', environment: 'Environment', education: 'Education',
  civic: 'Civic', safety: 'Safety', community: 'Community', lifeSatisfaction: 'Life Satisfaction',
};

const PERMA_PRETTY = {
  positiveEmotion: 'Positive Emotion', engagement: 'Engagement', relationships: 'Relationships',
  meaning: 'Meaning', accomplishment: 'Accomplishment',
};

function avg(obj) {
  const vals = Object.values(obj || {});
  return vals.length ? (vals.reduce((a, b) => a + Number(b), 0) / vals.length).toFixed(1) : '—';
}

function ScoreBar({ label, value, color }) {
  const pct = (Number(value) / 10) * 100;
  return (
    <div className="score-bar-item">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value">{value}/10</span>
      </div>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { surveyResults, addToast } = useGuest();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [existingHabits, setExistingHabits] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [histData, habitsData] = await Promise.all([
        getSurveyHistory(),
        getHabits()
      ]);
      const hList = Array.isArray(histData?.results) ? histData.results : (Array.isArray(histData) ? histData : null);
      if (!hList) console.warn('Unexpected dashboard history format:', histData);
      setHistory(hList || []);

      const habList = Array.isArray(habitsData?.habits) ? habitsData.habits : (Array.isArray(habitsData) ? habitsData : null);
      if (!habList) console.warn('Unexpected dashboard habits format:', habitsData);
      setExistingHabits(habList || []);
    } catch (err) {
      console.warn('Backend fetch failed, using local fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const latest = surveyResults || history?.[0] || null;

  const latestOECD = useMemo(() => 
    history.reduce((acc, row) => (row.oecd_scores && Object.keys(row.oecd_scores).length > 0) ? row.oecd_scores : acc, latest?.oecd_scores || latest?.scores?.oecd || {}),
  [history, latest]);

  const latestPERMA = useMemo(() => 
    history.reduce((acc, row) => (row.perma_scores && Object.keys(row.perma_scores).length > 0) ? row.perma_scores : acc, latest?.perma_scores || latest?.scores?.perma || {}),
  [history, latest]);

  const oecdScores = latestOECD;
  const permaScores = latestPERMA;
  const hasData = Object.keys(oecdScores).length > 0 || Object.keys(permaScores).length > 0;

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    try {
      await generateHabitPlan(oecdScores, permaScores);
      await fetchDashboardData();
    } catch (err) {
      addToast('Failed to generate AI plan', 'error');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleToggleHabit = async (habitId, currentStatus, hDay) => {
    const dayNum = parseInt(hDay.replace('day', ''));
    if (dayNum > currentDay) return; // Locked

    const newStatus = !currentStatus;
    // Optimistic Update
    setExistingHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed: newStatus } : h));
    
    try {
      await updateHabit(habitId, newStatus);
    } catch (err) {
      addToast('Failed to update habit status', 'error');
      // Rollback
      setExistingHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed: currentStatus } : h));
    }
  };

  const planCreatedAt = useMemo(() => {
    return existingHabits.length > 0
      ? Math.min(...existingHabits.map(h => new Date(h.created_at).getTime()))
      : null;
  }, [existingHabits]);

  const currentDay = useMemo(() => {
    if (!planCreatedAt) return 1;
    const diff = new Date().getTime() - planCreatedAt;
    return Math.min(7, Math.max(1, Math.floor(diff / 86400000) + 1));
  }, [planCreatedAt]);

  const streak = useMemo(() => {
    if (!existingHabits.length) return 0;
    let s = 0;
    for (let d = 1; d <= currentDay; d++) {
      const dayHabits = existingHabits.filter(h => h.day === `day${d}`);
      if (dayHabits.length > 0 && dayHabits.every(h => h.completed)) {
        s++;
      } else if (d < currentDay) {
        s = 0;
      }
    }
    return s;
  }, [existingHabits, currentDay]);

  const todayHabits = useMemo(() => 
    existingHabits.filter(h => h.day === `day${currentDay}`),
  [existingHabits, currentDay]);

  const completedTodayCount = todayHabits.filter(h => h.completed).length;

  const groupedHabits = useMemo(() => {
    const groups = {};
    existingHabits.forEach(h => {
      if (!groups[h.day]) groups[h.day] = [];
      groups[h.day].push(h);
    });
    return groups;
  }, [existingHabits]);

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;
  if (error) return <ErrorCard title="Dashboard Error" message={error} onRetry={() => window.location.reload()} />;

  const fireEmojis = '🔥'.repeat(Math.min(streak, 3)) + (streak >= 3 ? ` ${streak} days` : streak > 0 ? ` ${streak} days` : '');

  return (
    <div>
      <div className="page-header">
        <h1>🏠 Dashboard</h1>
        <p>Your personal wellbeing overview at a glance.</p>
      </div>

      {!hasData ? (
        <GlassCard style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No assessments yet</h3>
            <p>Complete your first OECD or PERMA assessment to unlock your personal wellbeing dashboard.</p>
            <ButtonGlow onClick={() => navigate('/survey')}>Take Assessment →</ButtonGlow>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { icon: '❤️', label: 'OECD Average', value: avg(oecdScores), sub: `${Object.keys(oecdScores).length} domains`, color: '#7c6fef' },
              { icon: '✨', label: 'PERMA Average', value: avg(permaScores), sub: `${Object.keys(permaScores).length} pillars`, color: '#5cbcf0' },
              { icon: '📈', label: 'Assessments', value: history.length || 1, sub: 'total taken', color: '#4caf8a' },
              { icon: streak > 0 ? '🔥' : '🎯', label: 'Habit Streak', value: streak > 0 ? `${streak} Days` : '0 Days', sub: streak > 0 ? fireEmojis : 'Complete today\'s tasks!', color: '#f0a949' },
            ].map((stat) => (
              <GlassCard key={stat.label} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-sub">{stat.sub}</div>
              </GlassCard>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {Object.keys(oecdScores).length > 0 && (
              <GlassCard className="chart-card">
                <h3>OECD Wellbeing Radar</h3>
                <RadarOECD scores={oecdScores} />
              </GlassCard>
            )}
            {Object.keys(permaScores).length > 0 && (
              <GlassCard className="chart-card">
                <h3>PERMA Profile</h3>
                <BarPERMA scores={permaScores} />
              </GlassCard>
            )}
            <GlassCard className="chart-card">
              <h3>Today's Habit Goal</h3>
              <HabitCompletion completed={completedTodayCount} total={todayHabits.length || 4} />
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                {completedTodayCount} of {todayHabits.length || 4} tasks completed today
              </p>
            </GlassCard>
          </div>

          {/* Score Breakdown */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {Object.keys(oecdScores).length > 0 && (
              <GlassCard>
                <div className="score-bar-wrap">
                  <h3 style={{ marginBottom: '1rem' }}>OECD Domain Scores</h3>
                  {Object.entries(oecdScores).map(([k, v]) => (
                    <ScoreBar key={k} label={OECD_PRETTY[k] || k} value={v} color="linear-gradient(90deg, #7c6fef, #a78bfa)" />
                  ))}
                </div>
              </GlassCard>
            )}
            {Object.keys(permaScores).length > 0 && (
              <GlassCard>
                <div className="score-bar-wrap">
                  <h3 style={{ marginBottom: '1rem' }}>PERMA Pillars</h3>
                  {Object.entries(permaScores).map(([k, v]) => (
                    <ScoreBar key={k} label={PERMA_PRETTY[k] || k} value={v} color="linear-gradient(90deg, #5cbcf0, #7ee8fa)" />
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Habit Plan */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3>🗓️ Your 7-Day Habit Plan (Day {currentDay})</h3>
              <ButtonGlow onClick={handleGeneratePlan} disabled={planLoading}>
                {planLoading ? 'Generating…' : '✨ Generate New Plan'}
              </ButtonGlow>
            </div>

            {planLoading && <LoadingSpinner label="Building your personalized plan…" />}
            {!planLoading && existingHabits.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(groupedHabits).sort(([a],[b]) => a.localeCompare(b)).map(([day, habits]) => {
                  const dayNum = parseInt(day.replace('day', ''));
                  const isFuture = dayNum > currentDay;
                  return (
                    <div key={day} className="habit-day" style={{ opacity: isFuture ? 0.6 : 1 }}>
                      <div className="habit-day-label">{day.replace('day', 'Day ')} {isFuture ? '🔒' : ''}</div>
                      {isFuture ? (
                        <div style={{ filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
                          {habits.map((h) => (
                            <div key={h.id} className="habit-item">
                              <input type="checkbox" className="habit-checkbox" disabled />
                              {h.habit_text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        habits.map((h) => (
                          <div key={h.id} className={`habit-item${h.completed ? ' completed' : ''}`}>
                            <input 
                              type="checkbox" 
                              className="habit-checkbox" 
                              checked={h.completed}
                              onChange={() => handleToggleHabit(h.id, h.completed, h.day)}
                            />
                            {h.habit_text}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!planLoading && existingHabits.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click "Generate Plan" to get your personalized 7-day habit plan based on your wellbeing scores.</p>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}


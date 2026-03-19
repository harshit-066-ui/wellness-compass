import { useState, useEffect } from 'react';
import { useGuest } from '../context/GuestContext';
import { getSurveyHistory } from '../services/api';
import { GlassCard, LoadingSpinner, ErrorCard } from '../components/ui';
import { TrendLine, RadarOECD, BarPERMA } from '../components/charts';

function avg(obj) {
  const vals = Object.values(obj || {});
  return vals.length ? (vals.reduce((a, b) => a + Number(b), 0) / vals.length).toFixed(1) : 'N/A';
}

export default function Analytics() {
  const { surveyResults } = useGuest();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSurveyHistory();
        const list = data?.results || data || [];
        if (!Array.isArray(list)) {
          console.warn("Unexpected analytics history format:", list);
        }
        setHistory(Array.isArray(list) ? list : []);
      } catch (err) {
        setError('Could not fetch history from server — showing local data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latest = surveyResults || history?.[0] || null;

  const latestOECD = history.reduce((acc, row) => (row.oecd_scores && Object.keys(row.oecd_scores).length > 0) ? row.oecd_scores : acc, latest?.oecd_scores || latest?.scores?.oecd || {});
  const latestPERMA = history.reduce((acc, row) => (row.perma_scores && Object.keys(row.perma_scores).length > 0) ? row.perma_scores : acc, latest?.perma_scores || latest?.scores?.perma || {});

  const oecdScores = latestOECD;
  const permaScores = latestPERMA;
  const hasData = Object.keys(oecdScores).length > 0 || Object.keys(permaScores).length > 0;
  
  const safeHistory = Array.isArray(history) ? history : [];
  const trendData = safeHistory.length > 1 ? safeHistory : (surveyResults ? [surveyResults] : []);

  if (loading) return <LoadingSpinner label="Loading analytics…" />;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Analytics</h1>
        <p>Deep-dive into your wellbeing trends and patterns over time.</p>
      </div>

      {error && (
        <GlassCard style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', borderColor: 'rgba(240,169,73,0.35)' }}>
          <p style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>⚠️ {error}</p>
        </GlassCard>
      )}

      {!hasData ? (
        <GlassCard style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No data yet</h3>
            <p>Complete an assessment to see your analytics and trends here.</p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'OECD Average', value: avg(oecdScores), icon: '🌍', color: '#7c6fef' },
              { label: 'PERMA Average', value: avg(permaScores), icon: '✨', color: '#5cbcf0' },
              { label: 'Assessments Logged', value: safeHistory.length || 1, icon: '📋', color: '#4caf8a' },
            ].map((m) => (
              <GlassCard key={m.label} className="stat-card">
                <div className="stat-icon">{m.icon}</div>
                <div className="stat-label">{m.label}</div>
                <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
              </GlassCard>
            ))}
          </div>

          {/* Trend Chart */}
          {trendData.length >= 1 && (
            <GlassCard className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <h3>📈 Wellbeing Trend Over Time</h3>
              {trendData.length < 2 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                  Complete at least 2 assessments to see trend data.
                </p>
              ) : (
                <TrendLine history={trendData} />
              )}
            </GlassCard>
          )}

          {/* Side-by-side charts */}
          <div className="grid-2">
            {Object.keys(oecdScores).length > 0 && (
              <GlassCard className="chart-card">
                <h3>OECD Radar</h3>
                <RadarOECD scores={oecdScores} />
              </GlassCard>
            )}
            {Object.keys(permaScores).length > 0 && (
              <GlassCard className="chart-card">
                <h3>PERMA Bar</h3>
                <BarPERMA scores={permaScores} />
              </GlassCard>
            )}
          </div>

          {/* History Table */}
          {safeHistory.length > 0 && (
            <GlassCard style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Assessment History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      {['Date', 'Type', 'OECD Avg', 'PERMA Avg'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeHistory.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ background: 'rgba(124,111,239,0.15)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.78rem' }}>
                            {row.type || 'Mixed'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#7c6fef', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {avg(row.oecd_scores || row.scores?.oecd || {})}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#5cbcf0', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {avg(row.perma_scores || row.scores?.perma || {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}

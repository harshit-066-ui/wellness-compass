import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/GuestContext';
import { submitSurvey, getSurveyHistory } from '../services/api';
import { OECD_SCHEMA, PERMA_SCHEMA } from '../constants/surveySchemas';
import { GlassCard, ButtonGlow, LoadingSpinner } from '../components/ui';

function RangeSlider({ label, icon, description, value, onChange }) {
  const pct = (value / 10) * 100;
  return (
    <GlassCard className="survey-domain-card">
      <div className="survey-domain-header">
        <span className="survey-domain-icon">{icon}</span>
        <div>
          <h3>{label}</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>{description}</p>
        </div>
      </div>
      <div className="survey-slider-wrap">
        <div className="survey-slider-label">
          <span>0 – Poor</span>
          <span className="survey-slider-value">{value} / 10</span>
          <span>10 – Excellent</span>
        </div>
        <input
          type="range" min={0} max={10} step={1} value={value}
          style={{ '--pct': `${pct}%` }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </GlassCard>
  );
}

function SurveyForm({ schema, onSubmit, saving, restriction }) {
  const initScores = () =>
    Object.fromEntries(schema.domains.map((d) => [d.id, 5]));
  const [scores, setScores] = useState(initScores);

  const set = (id, val) => setScores((prev) => ({ ...prev, [id]: val }));

  return (
    <div>
      <GlassCard style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {schema.description} Rate each domain from 0 (very poor) to 10 (excellent).
        </p>
      </GlassCard>

      {restriction ? (
        <GlassCard style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239,83,80,0.3)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{restriction}</p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {schema.domains.map((d) => (
            <RangeSlider
              key={d.id}
              label={d.label}
              icon={d.icon}
              description={d.description}
              value={scores[d.id]}
              onChange={(v) => set(d.id, v)}
            />
          ))}
        </div>
      )}

      <ButtonGlow 
        onClick={() => onSubmit(scores)} 
        disabled={saving || !!restriction} 
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {saving ? 'Saving…' : `Submit ${schema.title}`}
      </ButtonGlow>
    </div>
  );
}

export default function Survey() {
  const { saveSurveyResults, addToast, surveyResults } = useGuest();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('oecd');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSurveyHistory();
        setHistory(Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []));
      } catch (err) {
        console.warn('Could not fetch survey history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getRestriction = (type) => {
    const latest = Array.isArray(history) ? history.find(h => h.type === type) : null;
    const lastDate = latest ? new Date(latest.created_at) : null;
    const now = new Date();

    if (!lastDate) return null;

    const diff = now - lastDate;
    if (diff < 24 * 60 * 60 * 1000) {
      return "You can take this assessment once per day. Please return tomorrow.";
    }
    return null;
  };

  const restriction = getRestriction(activeTab);

  const handleSubmit = async (scores) => {
    setSaving(true);
    try {
      const type = activeTab;
      await submitSurvey(type, scores).catch(() => {});
      const latestFromHistory = (Array.isArray(history) && history.length > 0) ? history[0] : {};
      const updated = {
        ...latestFromHistory,
        [`${type}_scores`]: scores,
        scores: { ...(latestFromHistory.scores || {}), [type]: scores },
        updated_at: new Date().toISOString(),
      };
      saveSurveyResults(updated);
      addToast(`${type.toUpperCase()} assessment saved! 🎉`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Failed to save assessment. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Checking assessment availability…" />;

  return (
    <div>
      <div className="page-header">
        <h1>📋 Assessments</h1>
        <p>Rate your wellbeing across scientific frameworks to unlock personalized insights.</p>
      </div>

      <div className="survey-tabs">
        <button
          className={`survey-tab${activeTab === 'oecd' ? ' active' : ''}`}
          onClick={() => setActiveTab('oecd')}
        >
          🌍 OECD Wellbeing Index
        </button>
        <button
          className={`survey-tab${activeTab === 'perma' ? ' active' : ''}`}
          onClick={() => setActiveTab('perma')}
        >
          ✨ PERMA Model
        </button>
      </div>

      <SurveyForm
        key={activeTab}
        schema={activeTab === 'oecd' ? OECD_SCHEMA : PERMA_SCHEMA}
        onSubmit={handleSubmit}
        saving={saving}
        restriction={restriction}
      />
    </div>
  );
}

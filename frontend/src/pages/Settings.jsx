import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/GuestContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard, ButtonGlow } from '../components/ui';
import { SURVEY_RESULTS_KEY } from '../constants/config';

function FrameworkModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <GlassCard className="modal-content education-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Framework Education</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <section className="edu-section">
            <h3>📖 Framework Overview</h3>
            <p>Wellness Compass integrates two of the world's most robust scientific frameworks to provide a holistic view of your wellbeing:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>OECD Better Life Index</h4>
                <p style={{ fontSize: '0.85rem' }}>A multidimensional framework mapping 11 domains of life quality, from housing and health to civic engagement.</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent2)', marginBottom: '0.5rem' }}>PERMA Model</h4>
                <p style={{ fontSize: '0.85rem' }}>The psychological pillar of positive psychology, focusing on Positive Emotion, Engagement, Relationships, Meaning, and Accomplishment.</p>
              </div>
            </div>
          </section>

          <section className="edu-section highlight">
            <h3>📊 How Scores Are Calculated</h3>
            <p>Each dimension is rated on a scale of <strong>0-10</strong> based on your responses to behavioral questions.</p>
            <ul className="edu-list">
              <li><strong>Scale:</strong> Your input (0-10) directly maps to your domain strength.</li>
              <li><strong>Visualization:</strong> Radar charts show the "shape" of your wellbeing—ideal balance is indicated by a full, rounded area.</li>
              <li><strong>AI Guidance:</strong> Scores are analyzed by the AI coach to suggest habits that strengthen your lowest-scoring domains first.</li>
            </ul>
          </section>

          <section className="edu-section">
            <h3>🎯 Why These Models Matter</h3>
            <p>Wellbeing isn't just about feeling good; it's about "functioning well." These models identify precisely where your life feels rich and where it feels depleted. By measuring specifically (e.g., comparing "Engagement" vs "Meaning"), you can take targeted action rather than general self-care.</p>
          </section>

          <section className="edu-section">
            <h3>📜 History</h3>
            <p>The OECD framework was launched in 2011 as part of the "Better Life Initiative" to measure social progress beyond economic data. The PERMA model was introduced by Martin Seligman in his seminal work "Flourish" as the primary scientific bridge between psychology and actionable wellbeing.</p>
          </section>

          <section className="edu-section">
            <h3>🏆 Scientific Recognition</h3>
            <p>These frameworks are used by the World Health Organization (WHO), national governments, and leading universities. They represent the "Gold Standard" in modern wellbeing research and are validated by over a decade of peer-reviewed statistical studies.</p>
          </section>

          <section className="edu-section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <h3>📚 Scientific Sources & Citations</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Survey questions in Wellness Compass are adapted from established wellbeing research frameworks including the OECD Better Life Initiative and the PERMA Model from Positive Psychology.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <GlassCard style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>Organisation for Economic Co-operation and Development (OECD). (2020).<br/><span style={{ color: 'var(--text-secondary)' }}>How’s Life? Measuring Well-Being. OECD Publishing.</span></p>
              </GlassCard>
              <GlassCard style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>Organisation for Economic Co-operation and Development (OECD). (2013).<br/><span style={{ color: 'var(--text-secondary)' }}>OECD Guidelines on Measuring Subjective Well-Being. OECD Publishing.</span></p>
              </GlassCard>
              <GlassCard style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>Seligman, M. E. P. (2011).<br/><span style={{ color: 'var(--text-secondary)' }}>Flourish: A Visionary New Understanding of Happiness and Well-being. Free Press.</span></p>
              </GlassCard>
              <GlassCard style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>Butler, J., & Kern, M. (2016).<br/><span style={{ color: 'var(--text-secondary)' }}>The PERMA-Profiler: A brief multidimensional measure of flourishing. International Journal of Wellbeing.</span></p>
              </GlassCard>
              <GlassCard style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>Diener, E., Emmons, R., Larsen, R., & Griffin, S. (1985).<br/><span style={{ color: 'var(--text-secondary)' }}>The Satisfaction With Life Scale. Journal of Personality Assessment.</span></p>
              </GlassCard>
            </div>
          </section>
        </div>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <ButtonGlow onClick={onClose}>Understood</ButtonGlow>
        </div>
      </GlassCard>
    </div>
  );
}

export default function Settings() {
  const { addToast, saveSurveyResults } = useGuest();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showEdu, setShowEdu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      addToast('Failed to sign out', 'error');
    }
  };


  const sections = [
    {
      title: '👤 Account',
      rows: [
        {
          label: 'Logged in as',
          desc: user?.email || 'Not logged in',
          action: (
            <ButtonGlow variant="secondary" onClick={handleSignOut} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              Sign Out 👋
            </ButtonGlow>
          ),
        },
      ],
    },
    {
      title: '🗄️ Data',
      rows: [
        {
          label: 'Storage Mode',
          desc: 'All data stored securely in Supabase',
          action: <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● Cloud Sync</span>,
        },
        {
          label: 'Export Data',
          desc: 'Download your wellbeing data as JSON',
          action: (
            <ButtonGlow variant="secondary" onClick={() => {
              const data = {
                userEmail: user?.email,
                surveyResults: JSON.parse(localStorage.getItem(SURVEY_RESULTS_KEY) || 'null'),
                exportedAt: new Date().toISOString(),
              };
              const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
              const a = document.createElement('a'); a.href = url; a.download = 'wellness-compass-data.json'; a.click();
              URL.revokeObjectURL(url);
              addToast('Data exported!', 'success');
            }}>Export JSON</ButtonGlow>
          ),
        },
      ],
    },
    {
      title: 'ℹ️ About',
      rows: [
        { label: 'App Version', desc: 'Wellness Compass v1.1.0', action: <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>v1.1.0</span> },
        { 
          label: 'Framework', 
          desc: 'OECD Better Life Index + PERMA Model by Martin Seligman', 
          action: <ButtonGlow variant="secondary" onClick={() => setShowEdu(true)}>View Details</ButtonGlow>,
          clickable: true
        },
        { label: 'Privacy', desc: 'Authenticated session is required. Your data is privately stored in your Supabase profile.', action: null },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account, data, and preferences.</p>
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="settings-section">
          <GlassCard style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{sec.title}</h3>
            {sec.rows.map((row) => (
              <div 
                key={row.label} 
                className={`settings-row${row.clickable ? ' clickable' : ''}`}
                onClick={row.clickable ? row.action.props.onClick : null}
              >
                <div className="settings-row-info">
                  <h4>{row.label}</h4>
                  <p>{row.desc}</p>
                </div>
                {row.action && <div style={{ flexShrink: 0, marginLeft: '1rem' }}>{row.action}</div>}
              </div>
            ))}
          </GlassCard>
        </div>
      ))}

      {showEdu && <FrameworkModal onClose={() => setShowEdu(false)} />}
    </div>
  );
}

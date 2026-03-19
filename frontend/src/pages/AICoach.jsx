import { useState, useEffect, useRef } from 'react';
import { useGuest } from '../context/GuestContext';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage, getChatHistory, getSurveyHistory } from '../services/api';
import { GlassCard, LoadingSpinner } from '../components/ui';
import ReactMarkdown from 'react-markdown';

const WELCOME = {
  role: 'ai',
  content: "👋 Hi! I'm your AI Wellness Coach. I've reviewed your wellbeing scores and I'm here to help you thrive. Ask me anything about mental health, habits, stress management, or your assessment results!",
};

export default function AICoach() {
  const { addToast } = useGuest();
  const { user } = useAuth();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [surveyResults, setSurveyResults] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [chatData, surveyData] = await Promise.all([
          getChatHistory(),
          getSurveyHistory()
        ]);

        // Load chat history
        if (chatData?.history || chatData) {
          const list = Array.isArray(chatData.history) ? chatData.history : (Array.isArray(chatData) ? chatData : null);
          if (list && list.length > 0) {
            const loaded = list.map(m => ({
              role: m.role === 'assistant' ? 'ai' : 'user',
              content: m.content
            }));
            setMessages(loaded);
          }
        }

        // Load latest survey results for context
        const results = Array.isArray(surveyData?.results) ? surveyData.results : (Array.isArray(surveyData) ? surveyData : []);
        if (results.length > 0) {
          setSurveyResults(results[0]);
        }
      } catch (err) {
        console.error('Failed to load chat data:', err);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const oecdScores = surveyResults?.oecd_scores || surveyResults?.scores?.oecd || {};
    const permaScores = surveyResults?.perma_scores || surveyResults?.scores?.perma || {};

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));
      const result = await sendChatMessage(text, history, oecdScores, permaScores);
      const aiContent = result?.reply || result?.message || result?.content || 'I\'m here to help! Could you rephrase that?';
      setMessages((prev) => [...prev, { role: 'ai', content: aiContent }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: "I'm having trouble connecting right now. Please try again in a moment. 🔄" },
      ]);
      addToast('Connection issue — using fallback response', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const suggestions = [
    'How can I improve my work-life balance?',
    'Give me a morning routine for better mental health',
    'What are tiny habits I can start today?',
    'How can I build stronger relationships?',
  ];

  return (
    <div>
      <div className="page-header">
        <h1>🤖 AI Wellness Coach</h1>
        <p>Your personal AI guide to better wellbeing, powered by your assessment data.</p>
      </div>

      {surveyResults && (
        <GlassCard style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            Your assessment data is loaded — ask me about your scores or request a personalized plan!
          </span>
        </GlassCard>
      )}

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              onClick={() => { setInput(s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <GlassCard className="chat-layout">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.role === 'ai' ? (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai">
              <LoadingSpinner label="" size={20} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask your wellness coach anything…"
            style={{ resize: 'none', maxHeight: '120px' }}
          />
          <button
            className="btn btn-primary"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ flexShrink: 0 }}
          >
            Send →
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

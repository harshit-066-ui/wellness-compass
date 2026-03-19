import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard, ButtonGlow } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage('');
    try {
      const result = await signIn(email, password);
      
      if (password) {
        // Password login or auto-register success
        if (result?.error) {
          setMessage(result.error.message || 'Failed to login.');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Magic Link
        setMessage('Check your email for the magic link!');
      }
      
      setCooldown(60);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh' 
    }}>
      <GlassCard style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login with your email to access your wellbeing journey.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Password (Optional)</label>
              <input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leave blank for Magic Link, or enter password to login/register instantly.</p>
            </div>
          </div>

          <ButtonGlow type="submit" disabled={loading || cooldown > 0} style={{ width: '100%' }}>
            {loading ? 'Processing...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send Magic Link / Login ✨'}
          </ButtonGlow>

          {message && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              borderRadius: '8px', 
              background: message.includes('Check') || message.includes('Success') ? 'rgba(76, 175, 138, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: message.includes('Check') || message.includes('Success') ? '#4caf8a' : '#f44336',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </form>
      </GlassCard>
    </div>
  );
}

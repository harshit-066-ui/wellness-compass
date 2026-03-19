import GlassCard from './GlassCard';

export default function ErrorCard({ title = 'Something went wrong', message, onRetry }) {
  return (
    <GlassCard className="error-card">
      <div className="error-card-icon">⚠️</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          Try again
        </button>
      )}
    </GlassCard>
  );
}

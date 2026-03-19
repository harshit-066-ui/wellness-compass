export default function ButtonGlow({ children, onClick, disabled, variant = 'primary', type = 'button', className = '', style = {} }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

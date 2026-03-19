import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/survey',    icon: '📋', label: 'Assessments' },
  { to: '/coach',     icon: '🤖', label: 'AI Coach' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/settings',  icon: '⚙️',  label: 'Settings' },
];

export default function SidebarNav() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧭</div>
        <span className="sidebar-logo-text">Wellness Compass</span>
      </div>

      <div className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SidebarNav from './components/SidebarNav';
import MeshBackground from './components/MeshBackground';
import { Toast } from './components/ui';
import { useGuest } from './context/GuestContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import AICoach from './pages/AICoach';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { toasts, removeToast } = useGuest();

  return (
    <AuthProvider>
      <BrowserRouter>
        <MeshBackground />
        <div className="app-shell">
          <SidebarNav />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
              <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
        <div className="toast-stack">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

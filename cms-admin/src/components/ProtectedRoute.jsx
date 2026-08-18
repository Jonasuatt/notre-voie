import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { staff, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-sm text-gray-400">Chargement…</div>;
  }
  if (!staff) return <Navigate to="/login" replace />;
  return children;
}

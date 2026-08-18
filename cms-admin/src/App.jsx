import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampagnesPage from './pages/CampagnesPage';
import CampagneDetailPage from './pages/CampagneDetailPage';
import AnnonceursPage from './pages/AnnonceursPage';
import ComptesPage from './pages/ComptesPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="campagnes" element={<CampagnesPage />} />
          <Route path="campagnes/:id" element={<CampagneDetailPage />} />
          <Route path="annonceurs" element={<AnnonceursPage />} />
          <Route path="comptes" element={<RequireRole roles={['ADMIN']}><ComptesPage /></RequireRole>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

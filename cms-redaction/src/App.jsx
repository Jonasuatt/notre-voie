import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArticlesListPage from './pages/ArticlesListPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import PrixVieCherePage from './pages/PrixVieCherePage';
import EditionsPage from './pages/EditionsPage';

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
          <Route path="articles" element={<ArticlesListPage />} />
          <Route path="articles/nouveau" element={<ArticleEditorPage />} />
          <Route path="articles/:id" element={<ArticleEditorPage />} />
          <Route path="prix-vie-chere" element={<PrixVieCherePage />} />
          <Route path="editions" element={<EditionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

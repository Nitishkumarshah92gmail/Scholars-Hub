import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';
import Bookmarks from './pages/Bookmarks';
import PdfTools from './pages/PdfTools';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-950">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/landing" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Feed />} />
        <Route path="explore" element={<Explore />} />
        <Route path="upload" element={<Upload />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="post/:id" element={<PostDetail />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="pdf-tools" element={<PdfTools />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1e3a5f',
                color: '#fff',
              },
            }}
          />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

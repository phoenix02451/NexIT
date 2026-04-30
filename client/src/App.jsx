import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { GoogleClientIdProvider, useGoogleClientId } from './context/GoogleClientIdContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Careers from './pages/Careers';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';

function RoutesTree() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function AppWithGoogleOAuth() {
  const { clientId } = useGoogleClientId();
  const id = (clientId || '').trim();
  if (id) {
    return (
      <GoogleOAuthProvider clientId={id}>
        <RoutesTree />
      </GoogleOAuthProvider>
    );
  }
  return <RoutesTree />;
}

export default function App() {
  return (
    <BrowserRouter>
      <GoogleClientIdProvider>
        <AuthProvider>
          <AppWithGoogleOAuth />
        </AuthProvider>
      </GoogleClientIdProvider>
    </BrowserRouter>
  );
}

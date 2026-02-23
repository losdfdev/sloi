import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const { isAuthenticated, initAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Инициализируем auth при загрузке
    initAuth();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-500 to-red-500">
        <div className="text-white text-center">
          <div className="mb-4 text-4xl">💕</div>
          <p className="text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<LoginPage />} />
        ) : (
          <>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat/:matchId" element={<ChatPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

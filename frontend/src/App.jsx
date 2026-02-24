import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import LikesPage from './pages/LikesPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const { user, isAuthenticated, initAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111827]">
        <div className="text-white text-center flex flex-col items-center">
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-pink-500 animate-pulse"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </div>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-pink-500/80 animate-pulse">Загрузка</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<LoginPage />} />
        ) : !user?.onboarding_completed ? (
          <>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<OnboardingPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/likes" element={<LikesPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<DiscoverPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

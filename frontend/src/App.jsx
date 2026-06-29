import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import GamesPage from './pages/Games/Games';
import SpinGame from './pages/Games/SpinGame';
import BetPage from './pages/Bet/Bet';
import ProfilePage from './pages/Profile/Profile';
import PublicProfilePage from './pages/Profile/PublicProfile';
import LeaderboardPage from './pages/Leaderboard/Leaderboard';
import AdminPage from './pages/Admin/Admin';

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="app-wrapper">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/spin" element={<SpinGame />} />
              <Route path="/bet" element={<BetPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<PublicProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#f0f0f8',
            border: '1px solid rgba(108,99,255,0.25)',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#00e5a0', secondary: '#1a1a24' } },
          error: { iconTheme: { primary: '#ff4d6d', secondary: '#1a1a24' } },
        }}
      />
    </WalletProvider>
  );
}

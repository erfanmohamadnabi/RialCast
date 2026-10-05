import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import './App.css';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import GamesPage from './pages/Games/Games';
import SpinGame from './pages/Games/SpinGame';
import DiceGame from './pages/Games/DiceGame';
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
              <Route path="/games/dice" element={<DiceGame />} />
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
            background: '#0d100d',
            color: '#f3f6f3',
            border: '1px solid #2b322b',
            borderRadius: '12px',
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: '0.875rem',
            boxShadow: 'none',
          },
          success: { iconTheme: { primary: '#39ff14', secondary: '#000000' } },
          error: { iconTheme: { primary: '#ff5d6c', secondary: '#000000' } },
          loading: { iconTheme: { primary: '#39ff14', secondary: '#2b322b' } },
        }}
      />
    </WalletProvider>
  );
}

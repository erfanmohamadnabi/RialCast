import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import api from '../../utils/api';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

function StatCard({ label, value, icon }) {
  return (
    <motion.div className="stat-card" variants={fadeUp}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const { connect, account } = useWallet();
  const [recentBets, setRecentBets] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get('/bets/recent/').then(r => setRecentBets(r.data)).catch(() => {});
    api.get('/bets/').then(r => setMatches(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-circles">
          <div className="hero-circle c1" />
          <div className="hero-circle c2" />
        </div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div className="hero-badge" variants={fadeUp}>
              <span className="badge badge-accent">🔴 Live on Sepolia Testnet</span>
            </motion.div>
            <motion.h1 className="hero-title" variants={fadeUp}>
              Bet, Spin &<br />
              <span className="gradient-text">Win on-chain</span>
            </motion.h1>
            <motion.p className="hero-subtitle" variants={fadeUp}>
              RialCast is a decentralized gaming platform where every action is
              recorded on Ethereum. Compete, earn points, and climb the leaderboard.
            </motion.p>
            <motion.div className="hero-actions" variants={fadeUp}>
              {!account ? (
                <button className="btn btn-primary hero-cta" onClick={connect}>
                  Connect Wallet to Play
                </button>
              ) : (
                <Link className="btn btn-primary hero-cta" to="/games">
                  Start Playing
                </Link>
              )}
              <Link className="btn btn-secondary" to="/leaderboard">
                Leaderboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <motion.div
            className="stats-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <StatCard label="Games Available" value="1+" icon="🎮" />
            <StatCard label="Network" value="Sepolia" icon="⛓️" />
            <StatCard label="Token" value="Points" icon="⭐" />
            <StatCard label="Status" value="Live" icon="🟢" />
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="home-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="section-header">
              <div>
                <h2 className="section-title">Games</h2>
                <p className="section-subtitle">Play on-chain games and earn points</p>
              </div>
              <Link to="/games" className="btn btn-secondary">View All</Link>
            </div>
          </motion.div>

          <motion.div
            className="games-preview-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <Link to="/games/spin" className="game-preview-card">
                <div className="game-preview-emoji">🎰</div>
                <div className="game-preview-info">
                  <h3>Spin Wheel</h3>
                  <p>Spin to win up to 100 points per roll</p>
                  <span className="badge badge-success">Available</span>
                </div>
                <div className="game-preview-arrow">→</div>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="game-preview-card locked">
                <div className="game-preview-emoji">🃏</div>
                <div className="game-preview-info">
                  <h3>Card Battle</h3>
                  <p>Coming soon</p>
                  <span className="badge badge-warning">Soon</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}

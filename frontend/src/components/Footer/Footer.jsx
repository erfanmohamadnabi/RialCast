import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#6c63ff" strokeWidth="2"/>
              <path d="M9 14 L14 8 L19 14 L14 20 Z" fill="#6c63ff"/>
              <circle cx="14" cy="14" r="3" fill="#00e5a0"/>
            </svg>
            <span>Rial<span style={{ color: 'var(--accent)' }}>Cast</span></span>
          </div>
          <p className="footer-tagline">On-chain gaming & betting on Ethereum Sepolia</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/">Home</Link>
            <Link to="/games">Games</Link>
            <Link to="/bet">Bet</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
          <div className="footer-col">
            <h4>Network</h4>
            <a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer">Etherscan</a>
            <a href="https://sepoliafaucet.com" target="_blank" rel="noreferrer">Sepolia Faucet</a>
            <a href="https://rialo.io" target="_blank" rel="noreferrer">Rialo.io</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RialCast — Built on Rialo</p>
      </div>
    </footer>
  );
}

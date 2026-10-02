import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { LogoMark } from '../ui';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <LogoMark size={26} />
            <span>RialCast</span>
          </div>
          <p className="footer-tagline">On-chain predictions and games on Ethereum Sepolia.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/">Home</Link>
            <Link to="/games">Games</Link>
            <Link to="/bet">Predict</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
          <div className="footer-col">
            <h4>Network</h4>
            <a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer">Etherscan <ArrowUpRight size={13} /></a>
            <a href="https://sepoliafaucet.com" target="_blank" rel="noreferrer">Sepolia faucet <ArrowUpRight size={13} /></a>
            <a href="https://rialo.io" target="_blank" rel="noreferrer">Rialo <ArrowUpRight size={13} /></a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} RialCast. Built on Rialo.</p>
        <p className="footer-note">Testnet only. Sepolia ETH has no monetary value.</p>
      </div>
    </footer>
  );
}

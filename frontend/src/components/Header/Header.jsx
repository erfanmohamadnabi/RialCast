import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import './Header.css';

export default function Header() {
  const { account, user, connect, disconnect, shortAddress } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/bet', label: 'Bet' },
    { to: '/games', label: 'Games' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  const handleAddressClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleDisconnect = () => {
    setDropdownOpen(false);
    disconnect();
  };

  return (
    <header className="header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#6c63ff" strokeWidth="2"/>
              <path d="M9 14 L14 8 L19 14 L14 20 Z" fill="#6c63ff"/>
              <circle cx="14" cy="14" r="3" fill="#00e5a0"/>
            </svg>
          </div>
          <span>Rial<span className="logo-accent">Cast</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <div className="header-wallet">
          {account ? (
            <div className="wallet-connected" ref={dropdownRef}>
              <button
                className="wallet-address-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="wallet-avatar" />
                ) : (
                  <div className="wallet-avatar-placeholder">
                    {shortAddress.slice(0, 2)}
                  </div>
                )}
                <span className="wallet-addr-text">{shortAddress}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="wallet-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button className="dropdown-item" onClick={handleAddressClick}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      My Profile
                    </button>
                    <button className="dropdown-item danger" onClick={handleDisconnect}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="btn btn-primary connect-btn" onClick={connect}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="currentColor" stroke="none"/>
                <path d="M2 11h3"/>
              </svg>
              Connect Wallet
            </button>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
            <span className={menuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

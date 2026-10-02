import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, User, LogOut, Menu, X, Target, Gamepad2, Trophy } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { LogoMark } from '../ui';
import './Header.css';

const navLinks = [
  { to: '/bet', label: 'Predict', icon: Target },
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

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
    function handleEscape(e) {
      if (e.key === 'Escape') { setDropdownOpen(false); setMenuOpen(false); }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const isActive = (to) => location.pathname.startsWith(to);

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
        <Link to="/" className="header-logo" aria-label="RialCast home">
          <LogoMark size={28} />
          <span>RialCast</span>
        </Link>

        <nav className="header-nav desktop-nav" aria-label="Primary">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
              {isActive(link.to) && <motion.span layoutId="nav-underline" className="nav-underline" />}
            </Link>
          ))}
        </nav>

        <div className="header-wallet">
          {account ? (
            <div className="wallet-connected" ref={dropdownRef}>
              <button
                className="wallet-address-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="wallet-avatar" />
                ) : (
                  <div className="wallet-avatar-placeholder">{shortAddress.slice(2, 4)}</div>
                )}
                <span className="wallet-addr-text mono">{shortAddress}</span>
                <ChevronDown size={14} className={`wallet-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="wallet-dropdown"
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.14 }}
                  >
                    <button className="dropdown-item" role="menuitem" onClick={handleAddressClick}>
                      <User size={16} /> My profile
                    </button>
                    <button className="dropdown-item danger" role="menuitem" onClick={handleDisconnect}>
                      <LogOut size={16} /> Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="btn btn-primary connect-btn" onClick={connect}>
              <Wallet size={16} />
              <span>Connect<span className="hide-xs"> wallet</span></span>
            </button>
          )}

          <button
            className="icon-btn hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mobile-menu-inner">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                  >
                    <Icon size={18} /> {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Wallet, Target, Trophy, ShieldCheck, KeyRound, Coins,
  Disc3, Spade, Network, Gamepad2, Plus, Minus, ShieldAlert, Link2, Users, BarChart3, Zap,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import api from '../../utils/api';
import TokenCreator from '../../components/TokenCreator/TokenCreator';
import './Home.css';

const heroContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const heroItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } },
};

const SAMPLE_MARKET = {
  title: 'Sample market',
  team1_name: 'Home',
  team2_name: 'Away',
  points_reward: 100,
  status: 'open',
  vote_percentages: { team1: 46, draw: 18, team2: 36, total: 0 },
  isSample: true,
};

/** Live preview of an open prediction market: real data when available. */
function MarketPreview({ market }) {
  const pct = market.vote_percentages || {};
  const rows = [
    { key: 'team1', label: market.team1_name, value: pct.team1 ?? 0 },
    { key: 'draw', label: 'Draw', value: pct.draw ?? 0 },
    { key: 'team2', label: market.team2_name, value: pct.team2 ?? 0 },
  ];
  const lead = Math.max(...rows.map(r => r.value));

  return (
    <motion.div className="market-preview" variants={heroItem} aria-label="Prediction market preview">
      <div className="market-preview-top">
        <span className="market-preview-live">
          {market.isSample ? 'Preview' : <><span className="live-dot" /> Live market</>}
        </span>
        <span className="badge cap badge-success">{market.status}</span>
      </div>
      <h3 className="market-preview-title">{market.title}</h3>

      <div className="market-rows">
        {rows.map((r, i) => (
          <div key={r.key} className={`market-row ${r.value === lead && lead > 0 ? 'lead' : ''}`}>
            <motion.div
              className="market-row-fill"
              initial={{ width: 0 }}
              animate={{ width: `${r.value}%` }}
              transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            />
            <span className="market-row-label">{r.label}</span>
            <span className="market-row-pct num">{r.value}%</span>
          </div>
        ))}
      </div>

      <div className="market-preview-foot">
        <span className="num">{pct.total ?? 0} votes</span>
        <span className="num">+{market.points_reward} pts</span>
      </div>
    </motion.div>
  );
}

const features = [
  {
    cls: 'span-4',
    icon: Target,
    title: 'Predict real match outcomes',
    text: 'Back the home side, the away side, or a draw. Your vote is a transaction, so the record can’t be rewritten after the whistle.',
    to: '/bet',
    cta: 'Browse markets',
    visual: 'bars',
  },
  {
    cls: 'span-2',
    icon: KeyRound,
    title: 'Your wallet is your login',
    text: 'Sign one message to sign in. No passwords, no email, no stored keys.',
  },
  {
    cls: 'span-2',
    icon: ShieldCheck,
    title: 'Verifiable by anyone',
    text: 'Every vote and spin has a transaction hash you can open on Etherscan.',
  },
  {
    cls: 'span-2',
    icon: Coins,
    title: 'Points that persist',
    text: 'Correct predictions and spins add to one running balance on your profile.',
  },
  {
    cls: 'span-2',
    icon: Trophy,
    title: 'Public leaderboard',
    text: 'See who is ahead, then open any player’s profile.',
    to: '/leaderboard',
    cta: 'View rankings',
  },
];

const steps = [
  { icon: Wallet, title: 'Connect your wallet', text: 'Use MetaMask and sign a short message to prove ownership. It costs no gas.' },
  { icon: Network, title: 'Switch to Sepolia', text: 'We prompt the network switch for you. Test ETH is free from a faucet.' },
  { icon: Gamepad2, title: 'Predict or play', text: 'Vote on a match, or spin the wheel for 0.001 ETH. Confirm in your wallet.' },
  { icon: Trophy, title: 'Earn and climb', text: 'Results are recorded to your profile and your rank updates on the leaderboard.' },
];

const faqs = [
  { q: 'Is real money involved?', a: 'No. RialCast runs on the Ethereum Sepolia testnet. Sepolia ETH has no market value and is available from public faucets.' },
  { q: 'Do I need to create an account?', a: 'No. Connect a wallet and sign a message. Your wallet address is your account, and we never see your private keys.' },
  { q: 'How are spin results decided?', a: 'The spin contract emits the result in your transaction. We read it from your receipt, animate the wheel to that segment, and record the points to your profile.' },
  { q: 'What are points for?', a: 'Points track your performance across predictions and games and decide your position on the leaderboard.' },
  { q: 'Which wallets work?', a: 'Any browser wallet that exposes the standard Ethereum provider, such as MetaMask. Mobile users can open RialCast inside their wallet’s built-in browser.' },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              className="faq-q"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
            >
              <span>{f.q}</span>
              {isOpen ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-a-${i}`}
                  className="faq-a-wrap"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <p className="faq-a">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { connect, account } = useWallet();
  const [recentBets, setRecentBets] = useState([]);
  const [matches, setMatches] = useState([]);
  const [openCount, setOpenCount] = useState(null);
  const [playerCount, setPlayerCount] = useState(null);

  useEffect(() => {
    api.get('/bets/recent/').then(r => setRecentBets(r.data)).catch(() => {});
    api.get('/bets/').then(r => {
      setMatches(r.data.slice(0, 3));
      setOpenCount(r.data.filter(m => m.status === 'open').length);
    }).catch(() => {});
    api.get('/leaderboard/').then(r => setPlayerCount(Array.isArray(r.data) ? r.data.length : null)).catch(() => {});
  }, []);

  const market = matches.find(m => m.status === 'open') || matches[0] || SAMPLE_MARKET;
  const recentCount = Array.isArray(recentBets) ? recentBets.length : null;
  const show = (v) => (v === null ? '–' : v);

  const stats = [
    { icon: Users, label: 'Players ranked', value: show(playerCount) },
    { icon: BarChart3, label: 'Open markets', value: show(openCount) },
    { icon: Zap, label: 'Recent votes', value: show(recentCount) },
    { icon: Disc3, label: 'Cost per spin', value: '0.001 ETH' },
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="container hero-inner">
          <motion.div className="hero-content" initial="hidden" animate="visible" variants={heroContainer}>
            <motion.span className="badge hero-badge" variants={heroItem}>
              <span className="live-dot" /> Live on Sepolia testnet
            </motion.span>
            <motion.h1 className="hero-title" variants={heroItem}>
              Every prediction and spin settles on Ethereum.
            </motion.h1>
            <motion.p className="hero-subtitle" variants={heroItem}>
              Sign in with your wallet, back the outcome you believe in, and earn points
              you can verify on-chain. No accounts, no passwords.
            </motion.p>
            <motion.div className="hero-actions" variants={heroItem}>
              {!account ? (
                <button className="btn btn-primary btn-lg" onClick={connect}>
                  <Wallet size={18} /> Connect wallet to play
                </button>
              ) : (
                <Link className="btn btn-primary btn-lg" to="/games">
                  Start playing <ArrowRight size={18} />
                </Link>
              )}
              <Link className="btn btn-secondary btn-lg" to="/bet">Browse predictions</Link>
            </motion.div>
            <motion.ul className="hero-trust" variants={heroItem}>
              <li><ShieldCheck size={15} /> Non-custodial</li>
              <li><Link2 size={15} /> Results on Etherscan</li>
              <li><ShieldAlert size={15} /> Testnet funds only</li>
            </motion.ul>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={heroContainer} className="hero-visual">
            <MarketPreview market={market} />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="stat-card">
                  <Icon size={18} className="stat-icon" />
                  <div className="stat-value num">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Built so you can check the work</h2>
            <p className="section-sub">The product is simple on purpose. What matters is that every action leaves a record you control.</p>
          </div>

          <div className="bento">
            {features.map(f => {
              const Icon = f.icon;
              const inner = (
                <>
                  <span className="icon-tile"><Icon size={20} /></span>
                  <div className="bento-body">
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                  {f.visual === 'bars' && (
                    <div className="bento-bars" aria-hidden="true">
                      <div><i style={{ width: '58%' }} /></div>
                      <div><i style={{ width: '14%' }} /></div>
                      <div><i style={{ width: '28%' }} /></div>
                    </div>
                  )}
                  {f.cta && <span className="bento-link">{f.cta} <ArrowUpRight size={15} /></span>}
                </>
              );
              return f.to ? (
                <Link key={f.title} to={f.to} className={`bento-tile card card-interactive ${f.cls}`}>{inner}</Link>
              ) : (
                <div key={f.title} className={`bento-tile card ${f.cls}`}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="section">
        <div className="container">
          <div className="section-head-row">
            <div className="section-head">
              <h2 className="section-title">Games</h2>
              <p className="section-sub">Play on-chain games and add to your points balance.</p>
            </div>
            <Link to="/games" className="btn btn-secondary">View all games</Link>
          </div>

          <div className="games-preview-grid">
            <Link to="/games/spin" className="game-preview-card card card-interactive">
              <span className="icon-tile accent"><Disc3 size={22} /></span>
              <div className="game-preview-info">
                <h3>Spin Wheel</h3>
                <p>Win up to 100 points per spin.</p>
              </div>
              <span className="badge badge-success">Available</span>
              <ArrowUpRight size={18} className="game-preview-arrow" />
            </Link>
            <div className="game-preview-card card locked">
              <span className="icon-tile"><Spade size={22} /></span>
              <div className="game-preview-info">
                <h3>Card Battle</h3>
                <p>Head-to-head card duels.</p>
              </div>
              <span className="badge badge-warning">Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">From wallet to leaderboard in four steps</h2>
          </div>
          <ol className="steps">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="step">
                  <div className="step-top">
                    <span className="icon-tile"><Icon size={20} /></span>
                    <span className="step-num num">{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <TokenCreator />

      {/* FAQ */}
      <section className="section">
        <div className="container faq-layout">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2 className="section-title">Questions, answered</h2>
            <p className="section-sub">Anything else, ask in the community or check the contract on Etherscan.</p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="section-title">Make your first prediction today.</h2>
            <p className="section-sub">It takes a wallet, a little test ETH, and about a minute.</p>
            <div className="cta-actions">
              {!account ? (
                <button className="btn btn-primary btn-lg" onClick={connect}><Wallet size={18} /> Connect wallet</button>
              ) : (
                <Link className="btn btn-primary btn-lg" to="/bet">Open markets <ArrowRight size={18} /></Link>
              )}
              <a className="btn btn-secondary btn-lg" href="https://sepoliafaucet.com" target="_blank" rel="noreferrer">
                Get test ETH <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

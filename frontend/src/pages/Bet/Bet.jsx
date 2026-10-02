import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Check, CalendarX2 } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { getBetContract } from '../../utils/contracts';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PageHeader, LoadingState, EmptyState } from '../../components/ui';
import './Bet.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function MatchCard({ match, onVote }) {
  const { account, signer } = useWallet();
  const [voting, setVoting] = useState(false);
  const pct = match.vote_percentages;

  const handleVote = async (outcome) => {
    if (!account || !signer) { toast.error('Connect wallet to vote'); return; }
    if (match.user_vote) { toast.error('You already voted on this match'); return; }
    if (match.status !== 'open') { toast.error('Match is not open for voting'); return; }

    const chainMatchId = match.on_chain_match_id;
    if (!chainMatchId) {
      toast.error('This match has no on-chain ID. Contact admin.');
      return;
    }

    setVoting(true);
    try {
      const contract = getBetContract(signer);
      const outcomeNum = outcome === 'team1' ? 1 : outcome === 'team2' ? 2 : 3;

      // Verify match exists and is open on-chain before sending tx
      let stats;
      try {
        stats = await contract.getVoteStats(chainMatchId);
      } catch {
        toast.error(`Match #${chainMatchId} not found on-chain. Ask admin to create it first.`);
        setVoting(false);
        return;
      }

      const toastId = toast.loading('Confirm transaction…');
      const tx = await contract.vote(chainMatchId, outcomeNum);
      toast.loading('Waiting for confirmation…', { id: toastId });
      const receipt = await tx.wait();
      toast.dismiss(toastId);

      const res = await api.post(`/bets/${match.id}/vote/`, {
        outcome,
        tx_hash: receipt.hash,
      });
      toast.success('Your vote has been recorded');
      onVote(match.id, outcome, res.data.vote_percentages);
    } catch (err) {
      if (err.code !== 4001) toast.error(err.response?.data?.error || 'Vote failed');
    }
    setVoting(false);
  };

  const resolved = match.status === 'resolved';

  return (
    <motion.div
      className={`match-card card ${resolved ? 'resolved' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      layout
    >
      {match.image && (
        <img
          src={match.image.startsWith('http') ? match.image : `${API_URL.replace('/api','')}${match.image}`}
          alt={match.title}
          className="match-image"
        />
      )}
      <div className="match-content">
        <div className="match-header">
          <h3 className="match-title">{match.title}</h3>
          <div className="match-badges">
            <span className={`badge cap badge-${match.status === 'open' ? 'success' : match.status === 'resolved' ? 'accent' : 'warning'}`}>
              {match.status}
            </span>
            <span className="match-points">+{match.points_reward} pts</span>
          </div>
        </div>
        {match.description && <p className="match-desc">{match.description}</p>}

        {resolved && match.result && (
          <div className="match-result-banner">
            <Trophy size={16} />
            <span>Result: {match.result === 'team1' ? match.team1_name : match.result === 'team2' ? match.team2_name : 'Draw'}</span>
            {match.user_vote && match.user_vote === match.result && (
              <span className="winner-badge">You won +{match.points_reward} pts</span>
            )}
          </div>
        )}

        <div className="vote-buttons">
          <VoteButton
            label={match.team1_name}
            pct={pct.team1}
            outcome="team1"
            selected={match.user_vote === 'team1'}
            correct={resolved && match.result === 'team1'}
            disabled={!!match.user_vote || voting || match.status !== 'open'}
            onClick={() => handleVote('team1')}
          />
          <VoteButton
            label="Draw"
            pct={pct.draw}
            outcome="draw"
            selected={match.user_vote === 'draw'}
            correct={resolved && match.result === 'draw'}
            disabled={!!match.user_vote || voting || match.status !== 'open'}
            onClick={() => handleVote('draw')}
          />
          <VoteButton
            label={match.team2_name}
            pct={pct.team2}
            outcome="team2"
            selected={match.user_vote === 'team2'}
            correct={resolved && match.result === 'team2'}
            disabled={!!match.user_vote || voting || match.status !== 'open'}
            onClick={() => handleVote('team2')}
          />
        </div>
        <p className="vote-total num">{pct.total} votes total</p>
      </div>
    </motion.div>
  );
}

function VoteButton({ label, pct, outcome, selected, correct, disabled, onClick }) {
  return (
    <button
      className={`vote-btn ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${outcome}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <motion.div
        className="vote-btn-bar"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      />
      <span className="vote-btn-label">
        {selected && <Check size={14} />}
        <span>{label}</span>
      </span>
      <span className="vote-btn-pct num">{pct}%</span>
    </button>
  );
}

export default function BetPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bets/').then(r => {
      setMatches(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleVote = (matchId, outcome, newPct) => {
    setMatches(prev => prev.map(m =>
      m.id === matchId
        ? { ...m, user_vote: outcome, vote_percentages: newPct }
        : m
    ));
  };

  return (
    <div className="bet-page page">
      <div className="container">
        <PageHeader
          title="Football predictions"
          subtitle="Predict match outcomes on-chain and earn points for every correct call."
        />

        {loading ? (
          <LoadingState label="Loading matches…" />
        ) : matches.length === 0 ? (
          <EmptyState icon={CalendarX2} title="No matches yet">
            New markets will appear here as soon as they’re created. Check back soon.
          </EmptyState>
        ) : (
          <div className="matches-grid">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

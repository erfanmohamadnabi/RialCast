import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Users, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { PageHeader, LoadingState, EmptyState, XIcon } from '../../components/ui';
import './Leaderboard.css';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/leaderboard/').then(r => {
      setPlayers(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRowClick = (player) => {
    navigate(`/profile/${player.id}`);
  };

  const rankBadge = (rank) => {
    if (rank === 1) return <span className="rank-chip r1"><Crown size={13} /></span>;
    if (rank <= 3) return <span className="rank-chip r2">{rank}</span>;
    return <span className="rank-plain num">{rank}</span>;
  };

  return (
    <div className="leaderboard-page page">
      <div className="container">
        <PageHeader
          title="Leaderboard"
          subtitle="Top players by points earned across all games and predictions."
        />

        {loading ? (
          <LoadingState label="Loading leaderboard…" />
        ) : players.length === 0 ? (
          <EmptyState icon={Users} title="No players yet">
            Be the first to make a prediction or spin the wheel.
          </EmptyState>
        ) : (
          <div className="lb-table-wrapper">
            {players.length >= 3 && (
              <div className="podium">
                {[players[1], players[0], players[2]].map((player, idx) => {
                  const positions = [2, 1, 3];
                  const pos = positions[idx];
                  return (
                    <motion.button
                      type="button"
                      key={player.id}
                      className={`podium-item card card-interactive rank-${pos}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.4 }}
                      onClick={() => handleRowClick(player)}
                    >
                      <div className="podium-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt="" />
                        ) : (
                          <div className="lb-avatar-placeholder">{player.username?.slice(0, 2) || '?'}</div>
                        )}
                        <span className="podium-rank-badge">{rankBadge(pos)}</span>
                      </div>
                      <div className="podium-name">{player.username}</div>
                      <div className="podium-points num">{player.points.toLocaleString()} <span>pts</span></div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="lb-table card" role="table" aria-label="Leaderboard">
              <div className="lb-table-head" role="row">
                <div className="lb-col rank" role="columnheader">Rank</div>
                <div className="lb-col player" role="columnheader">Player</div>
                <div className="lb-col social" role="columnheader">Social</div>
                <div className="lb-col wallet" role="columnheader">Wallet</div>
                <div className="lb-col points" role="columnheader">Points</div>
                <div className="lb-col chevron" aria-hidden="true" />
              </div>

              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  className={`lb-row ${i < 3 ? 'top-three' : ''}`}
                  role="row"
                  tabIndex={0}
                  onClick={() => handleRowClick(player)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRowClick(player); }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i, 10) * 0.025, duration: 0.3 }}
                >
                  <div className="lb-col rank" role="cell">{rankBadge(player.rank)}</div>
                  <div className="lb-col player" role="cell">
                    <div className="lb-player-info">
                      {player.avatar ? (
                        <img src={player.avatar} alt="" className="lb-avatar" />
                      ) : (
                        <div className="lb-avatar-placeholder">{player.username?.slice(0, 2) || '?'}</div>
                      )}
                      <span className="lb-username">{player.username}</span>
                    </div>
                  </div>
                  <div className="lb-col social" role="cell">
                    {player.twitter_link && (
                      <a
                        href={player.twitter_link}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn"
                        aria-label={`${player.username} on X`}
                        onClick={e => e.stopPropagation()}
                      >
                        <XIcon size={15} />
                      </a>
                    )}
                  </div>
                  <div className="lb-col wallet" role="cell">
                    <span className="lb-wallet mono">{player.short_wallet}</span>
                  </div>
                  <div className="lb-col points" role="cell">
                    <span className="lb-points num">{player.points.toLocaleString()}</span>
                  </div>
                  <div className="lb-col chevron" aria-hidden="true"><ChevronRight size={16} /></div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

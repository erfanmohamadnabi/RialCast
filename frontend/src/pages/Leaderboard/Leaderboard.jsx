import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import './Leaderboard.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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

  const rankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="leaderboard-page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">Leaderboard</h1>
          <p className="section-subtitle">Top players by points earned across all games</p>
        </motion.div>

        {loading ? (
          <div className="loading-state">Loading leaderboard…</div>
        ) : players.length === 0 ? (
          <div className="empty-state">No players yet. Be the first to play!</div>
        ) : (
          <motion.div
            className="lb-table-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Top 3 podium */}
            {players.length >= 3 && (
              <div className="podium">
                {[players[1], players[0], players[2]].map((player, idx) => {
                  const positions = [2, 1, 3];
                  const pos = positions[idx];
                  return (
                    <motion.div
                      key={player.id}
                      className={`podium-item rank-${pos}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                      onClick={() => handleRowClick(player)}
                    >
                      <div className="podium-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.username} />
                        ) : (
                          <div className="lb-avatar-placeholder">{player.username?.slice(0, 2) || '?'}</div>
                        )}
                        <span className="podium-rank-badge">{rankIcon(pos)}</span>
                      </div>
                      <div className="podium-name">{player.username}</div>
                      <div className="podium-points">{player.points.toLocaleString()} pts</div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div className="lb-table">
              <div className="lb-table-head">
                <div className="lb-col rank">#</div>
                <div className="lb-col player">Player</div>
                <div className="lb-col social">Social</div>
                <div className="lb-col wallet">Wallet</div>
                <div className="lb-col points">Points</div>
              </div>

              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  className={`lb-row ${i < 3 ? 'top-three' : ''}`}
                  onClick={() => handleRowClick(player)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="lb-col rank">
                    <span className="rank-num">{rankIcon(player.rank)}</span>
                  </div>
                  <div className="lb-col player">
                    <div className="lb-player-info">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.username} className="lb-avatar" />
                      ) : (
                        <div className="lb-avatar-placeholder">{player.username?.slice(0, 2) || '?'}</div>
                      )}
                      <span className="lb-username">{player.username}</span>
                    </div>
                  </div>
                  <div className="lb-col social">
                    {player.twitter_link && (
                      <a
                        href={player.twitter_link}
                        target="_blank"
                        rel="noreferrer"
                        className="social-link"
                        onClick={e => e.stopPropagation()}
                      >
                        <svg fill="white" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 30 30">
                          <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="lb-col wallet">
                    <span className="lb-wallet">{player.short_wallet}</span>
                  </div>
                  <div className="lb-col points">
                    <span className="lb-points">{player.points.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

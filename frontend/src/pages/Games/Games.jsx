import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Games.css';

const games = [
  { id: 'spin', name: 'Spin Wheel', desc: 'Spin the wheel and win up to 100 points per roll', emoji: '🎰', available: true, cost: '0.001 ETH' },
  { id: 'cards', name: 'Card Battle', desc: 'Compete in card duels against other players', emoji: '🃏', available: false, cost: 'Soon' },
  { id: 'dice', name: 'Dice Roll', desc: 'Roll the dice and earn points', emoji: '🎲', available: false, cost: 'Soon' },
];

export default function GamesPage() {
  return (
    <div className="games-page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">Games</h1>
          <p className="section-subtitle">On-chain games powered by smart contracts on Sepolia Testnet</p>
        </motion.div>

        <div className="games-grid">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {game.available ? (
                <Link to={`/games/${game.id}`} className="game-card available">
                  <div className="game-card-emoji">{game.emoji}</div>
                  <div className="game-card-body">
                    <h3>{game.name}</h3>
                    <p>{game.desc}</p>
                  </div>
                  <div className="game-card-footer">
                    <span className="badge badge-success">Live</span>
                    <span className="game-cost">{game.cost}</span>
                  </div>
                </Link>
              ) : (
                <div className="game-card locked">
                  <div className="game-card-emoji">{game.emoji}</div>
                  <div className="game-card-body">
                    <h3>{game.name}</h3>
                    <p>{game.desc}</p>
                  </div>
                  <div className="game-card-footer">
                    <span className="badge badge-warning">Coming Soon</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

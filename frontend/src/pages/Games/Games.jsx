import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Disc3, Spade, Dices, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import './Games.css';

const games = [
  { id: 'spin', name: 'Spin Wheel', desc: 'Spin the wheel and win up to 100 points per roll.', icon: Disc3, available: true, cost: '0.001 ETH per spin' },
  { id: 'dice', name: 'Dice Roll', desc: 'Roll the dice and win up to 50 points per roll.', icon: Dices, available: true, cost: '0.001 ETH per roll' },
  { id: 'cards', name: 'Card Battle', desc: 'Compete in card duels against other players.', icon: Spade, available: false, cost: 'Soon' },
];

export default function GamesPage() {
  return (
    <div className="games-page page">
      <div className="container">
        <PageHeader
          title="Games"
          subtitle="On-chain games powered by smart contracts on Sepolia testnet."
        />

        <div className="games-grid">
          {games.map((game, i) => {
            const Icon = game.icon;
            const body = (
              <>
                <div className="game-card-top">
                  <span className={`icon-tile ${game.available ? 'accent' : ''}`}><Icon size={22} /></span>
                  {game.available && <ArrowUpRight size={20} className="game-card-arrow" />}
                </div>
                <div className="game-card-body">
                  <h3>{game.name}</h3>
                  <p>{game.desc}</p>
                </div>
                <div className="game-card-footer">
                  {game.available ? <span className="badge badge-success">Live</span> : <span className="badge badge-warning">Coming soon</span>}
                  {game.available && <span className="game-cost num">{game.cost}</span>}
                </div>
              </>
            );
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                {game.available ? (
                  <Link to={`/games/${game.id}`} className="game-card card card-interactive available">{body}</Link>
                ) : (
                  <div className="game-card card locked">{body}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

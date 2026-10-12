import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { Dices, Trophy, Wallet, Coins } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { getSpinContract, SPIN_FEE, DICE_POINTS, getDiceFace } from '../../utils/contracts';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui';
import './DiceGame.css';

const FACES = [1, 2, 3, 4, 5, 6];

// Container rotation (deg) that brings each face to the front.
const FACE_ROTATION = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

// Pip positions on a 3x3 grid (cells numbered 0-8).
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function DieFace({ value }) {
  return (
    <div className={`die-face die-face-${value}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className={`die-cell ${PIPS[value].includes(i) ? 'on' : ''}`}>
          {PIPS[value].includes(i) && <span className="die-pip" />}
        </span>
      ))}
    </div>
  );
}

export default function DiceGame() {
  const { account, signer, user, loadUserProfile } = useWallet();
  const [rolling, setRolling] = useState(false);
  const [shownFace, setShownFace] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  const rx = useMotionValue(-24);
  const ry = useMotionValue(32);
  const hop = useMotionValue(0);
  const shadowScale = useTransform(hop, [-90, 0], [0.55, 1]);
  const shadowOpacity = useTransform(hop, [-90, 0], [0.25, 0.6]);
  const loopRef = useRef([]);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
    loopRef.current.forEach((c) => c.stop());
  }, []);

  const stopLoop = () => {
    loopRef.current.forEach((c) => c.stop());
    loopRef.current = [];
  };

  // Tumble endlessly while we wait for the wallet / transaction.
  const startTumble = () => {
    stopLoop();
    loopRef.current = [
      animate(rx, rx.get() + 360 * 40, { duration: 24, ease: 'linear' }),
      animate(ry, ry.get() + 360 * 40, { duration: 32, ease: 'linear' }),
      animate(hop, [0, -26, 0], { duration: 0.7, ease: 'easeInOut', repeat: Infinity }),
    ];
  };

  // Throw the die and land it on `face`. Resolves when it has stopped.
  const throwTo = (face) => {
    stopLoop();
    const reduced = prefersReducedMotion();
    const duration = reduced ? 0.01 : 2.2;
    const target = FACE_ROTATION[face];
    const nextX = Math.ceil(rx.get() / 360) * 360 + (reduced ? 0 : 720) + target.x;
    const nextY = Math.ceil(ry.get() / 360) * 360 + (reduced ? 0 : 1080) + target.y;

    const ease = [0.16, 0.7, 0.3, 1];
    return Promise.all([
      animate(rx, nextX, { duration, ease }),
      animate(ry, nextY, { duration, ease }),
      animate(hop, [0, -90, 0, -34, 0, -10, 0], {
        duration,
        times: [0, 0.22, 0.45, 0.62, 0.78, 0.9, 1],
        ease: 'easeOut',
      }),
    ]);
  };

  const handleRoll = async () => {
    if (!account || !signer) {
      toast.error('Connect your wallet to play');
      return;
    }
    setRolling(true);
    setShownFace(null);
    setLastResult(null);

    let toastId;
    try {
      // Same contract as the Spin game: no new deployment needed.
      const contract = getSpinContract(signer);
      toastId = toast.loading('Confirm transaction in MetaMask…');

      const tx = await contract.spin({ value: SPIN_FEE });
      startTumble();
      toast.loading('Waiting for confirmation…', { id: toastId });
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find((e) => e && e.name === 'Spun');

      if (!event) throw new Error('Roll result not found in transaction');

      const contractResult = Number(event.args.result);
      const face = getDiceFace(receipt.hash, contractResult);
      toast.dismiss(toastId);

      await throwTo(face);
      if (!mountedRef.current) return;
      setShownFace(face);

      try {
        const res = await api.post('/games/dice/submit/', {
          tx_hash: receipt.hash,
          contract_result: contractResult,
        });
        setLastResult(res.data);
        setHistory((h) => [{ face: res.data.dice_value, points: res.data.points_earned }, ...h].slice(0, 8));
        toast.success(`You rolled a ${res.data.dice_value} and earned ${res.data.points_earned} points`);
        loadUserProfile();
      } catch (err) {
        toast.error('Failed to record result');
      }
    } catch (err) {
      stopLoop();
      if (toastId) toast.dismiss(toastId);
      if (err.code !== 4001 && err.code !== 'ACTION_REJECTED') {
        toast.error(err.shortMessage || err.message || 'Roll failed');
      }
    } finally {
      if (mountedRef.current) setRolling(false);
    }
  };

  const bestFace = shownFace === 6;

  return (
    <div className="dice-page page">
      <div className="container">
        <PageHeader
          title="Dice Roll"
          subtitle={<>Roll the die and win up to <strong>100 points</strong>. Each roll costs 0.001 Sepolia ETH.</>}
        />

        <div className="dice-layout">
          <div className="dice-panel card">
            <div className="dice-stage">
              <motion.div className="dice-hop" style={{ y: hop }}>
                <motion.div className={`dice-cube ${bestFace ? 'best' : ''}`} style={{ rotateX: rx, rotateY: ry }}>
                  {FACES.map((f) => <DieFace key={f} value={f} />)}
                </motion.div>
              </motion.div>
              <motion.div className="dice-shadow" style={{ scale: shadowScale, opacity: shadowOpacity }} aria-hidden="true" />
            </div>

            <div className="dice-history" aria-label="Recent rolls this session">
              {history.length === 0 ? (
                <span className="dice-history-empty">Your rolls will show up here</span>
              ) : (
                history.map((h, i) => (
                  <span key={i} className={`dice-chip num ${h.face === 6 ? 'best' : ''}`} title={`${h.points} pts`}>
                    {h.face}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="dice-sidebar">
            <div className="card dice-action-card">
              <div className="dice-action-top">
                <span className="icon-tile accent"><Dices size={20} /></span>
                <div>
                  <div className="dice-action-title">Roll the die</div>
                  <div className="dice-action-sub num">0.001 ETH · Sepolia</div>
                </div>
              </div>

              <button
                className={`btn btn-primary btn-lg btn-block ${rolling ? 'spinning' : ''}`}
                onClick={handleRoll}
                disabled={rolling || !account}
              >
                {rolling ? (
                  <><span className="spinner" /> Rolling…</>
                ) : (
                  <><Dices size={18} /> Roll for 0.001 ETH</>
                )}
              </button>

              {!account && (
                <p className="dice-notice"><Wallet size={14} /> Connect your wallet to play</p>
              )}

              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    className={`dice-result-card ${lastResult.points_earned >= 50 ? 'won' : ''}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="icon-tile accent"><Trophy size={20} /></span>
                    <div>
                      <div className="dice-result-points num">+{lastResult.points_earned} pts</div>
                      <div className="dice-result-total num">
                        Rolled {lastResult.dice_value} · Total: {lastResult.total_points} pts
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {user && (
                <div className="dice-user-points">
                  <span className="dice-points-label"><Coins size={15} /> Your points</span>
                  <span className="dice-points-value num">{user.points}</span>
                </div>
              )}
            </div>

            <div className="card dice-info-card">
              <h3>How to play</h3>
              <ol className="dice-steps">
                <li>Connect your MetaMask wallet</li>
                <li>Make sure you’re on Sepolia testnet</li>
                <li>Pay 0.001 ETH to roll the die</li>
                <li>The face you land on is the points you earn</li>
              </ol>

              <div className="dice-legend">
                {DICE_POINTS.map((pts, i) => (
                  <div key={i} className="dice-legend-item">
                    <span className="dice-legend-face num">{i + 1}</span>
                    <span className="num">{pts} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { Dices, Trophy, Wallet, Coins, RefreshCw } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { getSpinContract, SPIN_FEE, DICE_POINTS, deriveDiceValue } from '../../utils/contracts';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui';
import './DiceGame.css';

const FACES = [1, 2, 3, 4, 5, 6];

// Which cell (1-9, row by row on a 3x3 grid) holds a pip, per face value.
const PIPS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

// Cube rotation [rotateX, rotateY] in degrees that brings each face to the front.
// Faces: 1 front, 6 back, 2 right, 5 left, 3 top, 4 bottom (opposite faces add up to 7).
const FACE_ROTATION = {
  1: [0, 0],
  2: [0, -90],
  3: [-90, 0],
  4: [90, 0],
  5: [0, 90],
  6: [0, 180],
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const timeLabel = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

function DiceFace({ value, isResult }) {
  return (
    <div className={`dice-face dice-face-${value} ${isResult ? 'is-result' : ''}`} aria-hidden="true">
      {PIPS[value].map((cell) => (
        <span
          key={cell}
          className="dice-pip"
          style={{ gridRow: Math.ceil(cell / 3), gridColumn: ((cell - 1) % 3) + 1 }}
        />
      ))}
    </div>
  );
}

export default function DiceGame() {
  const { account, signer, user, loadUserProfile } = useWallet();

  // Motion values drive the cube so animations can be interrupted smoothly.
  const rx = useMotionValue(FACE_ROTATION[5][0]);
  const ry = useMotionValue(FACE_ROTATION[5][1]);
  const y = useMotionValue(0);
  const shadowScale = useTransform(y, [-130, 0], [0.55, 1]);
  const shadowOpacity = useTransform(y, [-130, 0], [0.18, 0.6]);

  const controlsRef = useRef([]);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState('idle'); // idle | confirm | waiting | rolling
  const [face, setFace] = useState(null); // face value after a completed roll
  const [lastResult, setLastResult] = useState(null);
  const [unsaved, setUnsaved] = useState(null); // roll that was rolled on-chain but not recorded yet
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState([]);

  const busy = status !== 'idle';

  const stopAll = useCallback(() => {
    controlsRef.current.forEach((c) => c && c.stop && c.stop());
    controlsRef.current = [];
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopAll();
    };
  }, [stopAll]);

  const loadRecent = useCallback(async () => {
    try {
      const res = await api.get('/games/dice/recent/');
      if (mountedRef.current) setRecent(res.data);
    } catch {
      /* the list is optional, ignore failures */
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  // Dice keeps tumbling while we wait for the wallet / the chain.
  const startTumble = () => {
    stopAll();
    if (prefersReducedMotion()) return;
    controlsRef.current = [
      animate(rx, rx.get() + 360 * 40, { duration: 40, ease: 'linear' }),
      animate(ry, ry.get() + 360 * 55, { duration: 40, ease: 'linear' }),
      animate(y, [0, -18, 0], { duration: 0.8, ease: 'easeInOut', repeat: Infinity }),
    ];
  };

  // Lands the cube on `value`: extra full turns on both axes, a few bounces.
  const rollTo = (value, { fast = false } = {}) =>
    new Promise((resolve) => {
      stopAll();
      const reduced = prefersReducedMotion();
      const [bx, by] = FACE_ROTATION[value];
      const cx = rx.get();
      const cy = ry.get();
      const extra = fast || reduced ? 0 : 1;
      // Target is congruent to the face's base angle (mod 360) and at least a couple of turns ahead.
      const nx = bx + 360 * Math.ceil((cx + 720 * extra - bx) / 360);
      const ny = by + 360 * Math.ceil((cy + 1080 * extra - by) / 360);
      const duration = reduced ? 0.3 : fast ? 0.6 : 2.3;

      const ax = animate(rx, nx, { duration, ease: [0.12, 0.7, 0.2, 1] });
      const ay = animate(ry, ny, { duration, ease: [0.12, 0.7, 0.2, 1] });
      const controls = [ax, ay];
      if (!reduced) {
        y.set(0);
        controls.push(
          animate(y, [0, -120, 0, -38, 0, -11, 0], {
            duration: duration * 0.9,
            times: [0, 0.2, 0.42, 0.6, 0.76, 0.9, 1],
            ease: 'easeOut',
          })
        );
      } else {
        y.set(0);
      }
      controlsRef.current = controls;
      ay.then(() => {
        y.set(0);
        resolve();
      });
    });

  const submitRoll = async ({ txHash, spinResult }) => {
    try {
      const res = await api.post('/games/dice/submit/', {
        tx_hash: txHash,
        spin_result: spinResult,
      });
      return { data: res.data };
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || null;
      return { error: msg || 'Failed to record result' };
    }
  };

  const applySaved = async (data, localValue) => {
    // Backend is the source of truth. Both sides use the same formula, so this should never differ.
    if (data.dice_value !== localValue && mountedRef.current) {
      await rollTo(data.dice_value, { fast: true });
    }
    if (!mountedRef.current) return;
    setFace(data.dice_value);
    setLastResult(data);
    toast.success(`You rolled a ${data.dice_value} and earned ${data.points_earned} points`);
    loadUserProfile();
    loadRecent();
  };

  const handleRoll = async () => {
    if (!account || !signer) {
      toast.error('Connect your wallet to play');
      return;
    }
    if (busy) return;

    setLastResult(null);
    setUnsaved(null);
    setFace(null);
    setStatus('confirm');
    startTumble();

    let toastId;
    try {
      const contract = getSpinContract(signer);
      toastId = toast.loading('Confirm transaction in MetaMask…');

      // Same on-chain contract as the spin game: no new deployment needed.
      const tx = await contract.spin({ value: SPIN_FEE });
      if (mountedRef.current) setStatus('waiting');
      toast.loading('Waiting for confirmation…', { id: toastId });
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e && e.name === 'Spun');
      if (!event) throw new Error('Roll result not found in the transaction');

      const spinResult = Number(event.args.result);
      const value = deriveDiceValue(receipt.hash, spinResult);
      toast.dismiss(toastId);
      if (!mountedRef.current) return;

      setStatus('rolling');
      const roll = { txHash: receipt.hash, spinResult, value };

      // Record on the backend right away (in parallel with the animation) so a
      // closed tab can't lose a roll that was already paid for on-chain.
      const savePromise = submitRoll(roll);
      await rollTo(value);
      const saved = await savePromise;

      if (saved.data) {
        await applySaved(saved.data, value);
      } else if (mountedRef.current) {
        setFace(value);
        setUnsaved({ ...roll, error: saved.error });
        toast.error(saved.error);
      }
      if (mountedRef.current) setStatus('idle');
    } catch (err) {
      toast.dismiss(toastId);
      if (!mountedRef.current) return;
      stopAll();
      y.set(0);
      setStatus('idle');
      // Settle the dice gently on the face it was showing before.
      rollTo(face || 5, { fast: true });
      if (err?.code !== 4001 && err?.code !== 'ACTION_REJECTED') {
        toast.error(err?.shortMessage || err?.message || 'Roll failed');
      }
    }
  };

  const retrySave = async () => {
    if (!unsaved || saving) return;
    setSaving(true);
    const saved = await submitRoll(unsaved);
    if (!mountedRef.current) return;
    if (saved.data) {
      setUnsaved(null);
      await applySaved(saved.data, unsaved.value);
    } else {
      setUnsaved({ ...unsaved, error: saved.error });
      toast.error(saved.error);
    }
    if (mountedRef.current) setSaving(false);
  };

  const shown = lastResult ? lastResult.dice_value : unsaved ? unsaved.value : face;
  const won = shown === 6;

  const buttonLabel = {
    idle: <><Dices size={18} /> Roll for 0.001 ETH</>,
    confirm: <><span className="spinner" /> Confirm in wallet…</>,
    waiting: <><span className="spinner" /> Waiting for confirmation…</>,
    rolling: <><span className="spinner" /> Rolling…</>,
  }[status];

  return (
    <div className="dice-page page">
      <div className="container">
        <PageHeader
          title="Dice Roll"
          subtitle={<>Roll the dice and earn up to <strong>50 points</strong>. Each roll costs 0.001 Sepolia ETH.</>}
        />

        <div className="dice-layout">
          <div className="dice-panel card">
            <div
              className="dice-stage"
              role="img"
              aria-label={shown ? `Dice showing ${shown}` : 'Dice'}
            >
              <div className="dice-scene">
                <motion.div className="dice-lift" style={{ y }}>
                  <div className="dice-tilt">
                    <motion.div
                      className={`dice-cube ${won && !busy ? 'is-max' : ''}`}
                      style={{ rotateX: rx, rotateY: ry }}
                    >
                      {FACES.map((v) => (
                        <DiceFace key={v} value={v} isResult={!busy && shown === v} />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div className="dice-shadow" style={{ scale: shadowScale, opacity: shadowOpacity }} />
              </div>
            </div>
          </div>

          <div className="dice-sidebar">
            <div className="card dice-action-card">
              <div className="dice-action-top">
                <span className="icon-tile accent"><Dices size={20} /></span>
                <div>
                  <div className="dice-action-title">Roll the dice</div>
                  <div className="dice-action-sub num">0.001 ETH · Sepolia</div>
                </div>
              </div>

              <button
                className={`btn btn-primary btn-lg btn-block ${busy ? 'spinning' : ''}`}
                onClick={handleRoll}
                disabled={busy || !account}
              >
                {buttonLabel}
              </button>

              {!account && (
                <p className="dice-notice"><Wallet size={14} /> Connect your wallet to play</p>
              )}

              <div aria-live="polite">
                <AnimatePresence>
                  {lastResult && (
                    <motion.div
                      className={`dice-result-card ${won ? 'won' : ''}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="icon-tile accent">
                        {won ? <Trophy size={20} /> : <Dices size={20} />}
                      </span>
                      <div>
                        <div className="result-points num">+{lastResult.points_earned} pts</div>
                        <div className="result-total num">
                          Rolled {lastResult.dice_value} · Total: {lastResult.total_points} pts
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {unsaved && (
                  <div className="dice-unsaved">
                    <p>
                      You rolled a <strong className="num">{unsaved.value}</strong>, but we couldn’t record it:
                      {' '}{unsaved.error}.
                    </p>
                    <button className="btn btn-secondary btn-block" onClick={retrySave} disabled={saving}>
                      {saving ? <><span className="spinner" /> Saving…</> : <><RefreshCw size={16} /> Try again</>}
                    </button>
                  </div>
                )}
              </div>

              {user && (
                <div className="user-points-display">
                  <span className="points-label"><Coins size={15} /> Your points</span>
                  <span className="points-value num">{user.points}</span>
                </div>
              )}
            </div>

            <div className="card dice-info-card">
              <h3>How to play</h3>
              <ol className="dice-steps">
                <li>Connect your MetaMask wallet</li>
                <li>Make sure you’re on Sepolia testnet</li>
                <li>Pay 0.001 ETH to roll</li>
                <li>The higher the face, the more points you earn</li>
              </ol>

              <div className="dice-points-grid">
                {DICE_POINTS.map((pts, i) => (
                  <div key={i} className={`dice-points-item ${shown === i + 1 ? 'active' : ''}`}>
                    <span className="dice-points-face num">{i + 1}</span>
                    <span className="num">{pts} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {recent.length > 0 && (
              <div className="card dice-recent-card">
                <h3>Recent rolls</h3>
                <ul className="dice-recent-list">
                  {recent.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      <span className="dice-recent-user">{r.username}</span>
                      <span className="dice-recent-face num">{r.dice_value}</span>
                      <span className="dice-recent-pts num">+{r.points_earned}</span>
                      <span className="dice-recent-time num">{timeLabel(r.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

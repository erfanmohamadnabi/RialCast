import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import { getSpinContract, SPIN_FEE, SEGMENT_LABELS, SEGMENT_COLORS, SEGMENT_POINTS } from '../../utils/contracts';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './SpinGame.css';

const NUM_SEGMENTS = 8;
const SPIN_DURATION = 4000;

function drawWheel(canvas, highlightedSegment = -1, currentAngle = 0) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const anglePerSeg = (2 * Math.PI) / NUM_SEGMENTS;

  ctx.clearRect(0, 0, size, size);

  // Draw segments
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    const startAngle = currentAngle + i * anglePerSeg - Math.PI / 2;
    const endAngle = startAngle + anglePerSeg;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = i === highlightedSegment
      ? '#fff'
      : SEGMENT_COLORS[i];
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,10,15,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + anglePerSeg / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = i === highlightedSegment ? '#000' : '#fff';
    ctx.font = `bold ${size * 0.042}px Space Grotesk, sans-serif`;
    ctx.fillText(SEGMENT_LABELS[i], radius - 12, 5);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.12, 0, 2 * Math.PI);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.strokeStyle = '#6c63ff';
  ctx.lineWidth = 3;
  ctx.stroke();
}

export default function SpinGame() {
  const { account, signer, user, loadUserProfile } = useWallet();
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const animRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    if (canvasRef.current) {
      drawWheel(canvasRef.current, -1, 0);
    }
  }, []);

  const animateSpin = (targetSegment, totalSpins = 6) => {
    const anglePerSeg = (2 * Math.PI) / NUM_SEGMENTS;
    const targetAngle = totalSpins * 2 * Math.PI
      + (NUM_SEGMENTS - targetSegment) * anglePerSeg
      - anglePerSeg / 2;

    const start = performance.now();
    const startAngle = angleRef.current % (2 * Math.PI);

    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + targetAngle * eased;
      angleRef.current = currentAngle;

      if (canvasRef.current) {
        drawWheel(canvasRef.current, -1, currentAngle);
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        if (canvasRef.current) {
          drawWheel(canvasRef.current, targetSegment, currentAngle);
        }
        setSpinning(false);
        setResult(targetSegment);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleSpin = async () => {
    if (!account || !signer) {
      toast.error('Connect your wallet to play!');
      return;
    }
    setSpinning(true);
    setResult(null);
    setLastResult(null);

    try {
      const contract = getSpinContract(signer);
      const toastId = toast.loading('Confirm transaction in MetaMask…');

      const tx = await contract.spin({ value: SPIN_FEE });
      toast.loading('Waiting for confirmation…', { id: toastId });
      const receipt = await tx.wait();

      // Parse event to get result
      const event = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find(e => e && e.name === 'Spun');

      const segment = event ? Number(event.args.result) : Math.floor(Math.random() * 8) + 1;
      toast.dismiss(toastId);

      animateSpin(segment - 1); // segments are 0-indexed in drawing

      // Submit to backend after animation
      setTimeout(async () => {
        try {
          const res = await api.post('/games/spin/submit/', {
            tx_hash: receipt.hash,
            result_segment: segment,
          });
          setLastResult(res.data);
          toast.success(`🎉 You earned ${res.data.points_earned} points!`);
          loadUserProfile();
        } catch (err) {
          toast.error('Failed to record result');
        }
      }, SPIN_DURATION + 500);

    } catch (err) {
      setSpinning(false);
      if (err.code !== 4001) {
        toast.error(err.message || 'Spin failed');
      }
    }
  };

  return (
    <div className="spin-page">
      <div className="container">
        <div className="spin-header">
          <h1 className="section-title">Spin Wheel</h1>
          <p className="section-subtitle">
            Spin the wheel for a chance to win up to <strong>100 points</strong>. Costs 0.001 Sepolia ETH.
          </p>
        </div>

        <div className="spin-layout">
          <div className="wheel-container">
            {/* Pointer */}
            <div className="wheel-pointer">▼</div>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="wheel-canvas"
            />
          </div>

          <div className="spin-sidebar">
            <div className="card spin-info-card">
              <h3>How to Play</h3>
              <ul className="spin-steps">
                <li>Connect your MetaMask wallet</li>
                <li>Make sure you're on Sepolia Testnet</li>
                <li>Pay 0.001 ETH to spin</li>
                <li>Land on a segment to earn points</li>
              </ul>

              <div className="spin-segments-legend">
                {SEGMENT_LABELS.map((label, i) => (
                  <div key={i} className="legend-item">
                    <div className="legend-color" style={{ background: SEGMENT_COLORS[i] }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`btn btn-primary spin-btn ${spinning ? 'spinning' : ''}`}
              onClick={handleSpin}
              disabled={spinning || !account}
            >
              {spinning ? (
                <>
                  <span className="spinner" />
                  Spinning...
                </>
              ) : (
                <>🎰 Spin (0.001 ETH)</>
              )}
            </button>

            {!account && (
              <p className="spin-notice">Connect your wallet to play</p>
            )}

            <AnimatePresence>
              {lastResult && (
                <motion.div
                  className="spin-result-card"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="result-emoji">
                    {SEGMENT_POINTS[result - 1] > 0 ? '🎉' : '😢'}
                  </div>
                  <div className="result-points">{lastResult.points_earned} pts</div>
                  <div className="result-total">Total: {lastResult.total_points} pts</div>
                </motion.div>
              )}
            </AnimatePresence>

            {user && (
              <div className="user-points-display">
                <span className="points-label">Your Points</span>
                <span className="points-value">{user.points}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

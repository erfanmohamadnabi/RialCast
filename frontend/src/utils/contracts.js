import { ethers } from 'ethers';
import contractsAbi from './contracts_abi.json';

export const SPIN_CONTRACT_ADDRESS = process.env.REACT_APP_SPIN_CONTRACT_ADDRESS;
export const BET_CONTRACT_ADDRESS = process.env.REACT_APP_BET_CONTRACT_ADDRESS;

export const SPIN_FEE = ethers.parseEther('0.001');

export function getSpinContract(signer) {
  return new ethers.Contract(
    SPIN_CONTRACT_ADDRESS,
    contractsAbi.SpinGame.abi,
    signer
  );
}

export function getBetContract(signer) {
  return new ethers.Contract(
    BET_CONTRACT_ADDRESS,
    contractsAbi.BetGame.abi,
    signer
  );
}

export const SEGMENT_LABELS = ['10 pts', '20 pts', '5 pts', '50 pts', '15 pts', '30 pts', '100 pts', '0 pts'];
// Graphite tones with the accent reserved for the highest-value segments.
export const SEGMENT_COLORS = ['#101310', '#1a1e1a', '#101310', '#1f3a1a', '#101310', '#1a1e1a', '#39ff14', '#1a1e1a'];
export const SEGMENT_POINTS = [10, 20, 5, 50, 15, 30, 100, 0];

// ---------------------------------------------------------------------------
// Dice game (reuses the SpinGame contract: spin() + the `Spun` event)
// ---------------------------------------------------------------------------

// Points per face, index 0 = face 1. Must match DICE_POINTS in backend/apps/games/dice.py
export const DICE_POINTS = [5, 10, 15, 20, 30, 50];

// Maps the on-chain spin result (1-8) to a fair die face (1-6).
// Must stay identical to derive_dice_value() in backend/apps/games/dice.py
export function deriveDiceValue(txHash, spinResult) {
  const seed = ethers.toUtf8Bytes(`${txHash.toLowerCase()}:${Number(spinResult)}`);
  return Number(BigInt(ethers.sha256(seed)) % 6n) + 1;
}

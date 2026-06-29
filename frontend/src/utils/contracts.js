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

export const SEGMENT_LABELS = ['🎰 10pts', '⭐ 20pts', '💎 5pts', '🔥 50pts', '✨ 15pts', '🚀 30pts', '👑 100pts', '😢 0pts'];
export const SEGMENT_COLORS = ['#6c63ff', '#00e5a0', '#ff4d6d', '#ffd166', '#a78bfa', '#38bdf8', '#f97316', '#374151'];
export const SEGMENT_POINTS = [10, 20, 5, 50, 15, 30, 100, 0];

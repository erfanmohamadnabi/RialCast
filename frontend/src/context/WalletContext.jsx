import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import api from '../utils/api';

const WalletContext = createContext(null);

export const useWallet = () => useContext(WalletContext);

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setSigner_] = useState(null);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('rc_token');
    if (!token) return;
    try {
      const res = await api.get('/users/profile/');
      setUser(res.data);
    } catch {
      localStorage.removeItem('rc_token');
      localStorage.removeItem('rc_refresh');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const savedAccount = localStorage.getItem('rc_account');
      if (savedAccount && window.ethereum) {
        try {
          const p = new ethers.BrowserProvider(window.ethereum);
          const accounts = await p.listAccounts();
          if (accounts.length > 0 && accounts[0].address.toLowerCase() === savedAccount.toLowerCase()) {
            const s = await p.getSigner();
            setAccount(savedAccount);
            setSigner_(p);
            setSigner(s);
            await loadUserProfile();
          }
        } catch {}
      }
      setLoading(false);
    };
    init();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect();
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      }
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not found. Please install it.');
      return;
    }
    try {
      await switchToSepolia();
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send('eth_requestAccounts', []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      const lowerAddr = addr.toLowerCase();

      // Get nonce from backend
      const nonceRes = await api.post('/users/nonce/', { wallet_address: lowerAddr });
      const { nonce, message } = nonceRes.data;

      // Sign
      const signature = await s.signMessage(message);

      // Auth
      const authRes = await api.post('/users/auth/', {
        wallet_address: lowerAddr,
        signature,
        nonce,
      });

      localStorage.setItem('rc_token', authRes.data.tokens.access);
      localStorage.setItem('rc_refresh', authRes.data.tokens.refresh);
      localStorage.setItem('rc_account', lowerAddr);

      setAccount(lowerAddr);
      setSigner_(p);
      setSigner(s);
      setUser(authRes.data.user);

      toast.success('Wallet connected!');
    } catch (err) {
      if (err.code !== 4001) {
        toast.error('Failed to connect wallet');
        console.error(err);
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner_(null);
    setSigner(null);
    setUser(null);
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_refresh');
    localStorage.removeItem('rc_account');
    toast.success('Wallet disconnected');
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  return (
    <WalletContext.Provider value={{
      account, provider, signer, user, loading,
      connect, disconnect, shortAddress,
      setUser, loadUserProfile,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

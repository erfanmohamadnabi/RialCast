import React, { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from '../../context/WalletContext';
import { contractABI, getBytecode } from '../../utils/tokenContract';
import './TokenCreator.css';

const SEPOLIA_CHAIN_ID = 11155111;

export default function TokenCreator() {
  const { signer, account, connect } = useWallet();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [count, setCount] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState(null);

  const handleDeploy = async (e) => {
    e.preventDefault();

    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      connect();
      return;
    }
    if (!name || !symbol || !count) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setDeploying(true);

      const network = await signer.provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== SEPOLIA_CHAIN_ID) {
        toast.error('Wallet network must be on ETH Sepolia');
        setDeploying(false);
        return;
      }

      const factory = new ethers.ContractFactory(contractABI, getBytecode(), signer);
      const contract = await factory.deploy(name, symbol, count);
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      setDeployedAddress(address);
      toast.success(`Token deployed: ${address}`);
    } catch (err) {
      console.error('Error deploying contract:', err);
      toast.error('Error deploying token: ' + (err.reason || err.message));
    } finally {
      setDeploying(false);
    }
  };

  return (
    <section className="token-creator-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Deploy Token</h2>
            <p className="section-subtitle">Deploy your token on the Sepolia network</p>
          </div>
        </div>

        <form className="token-creator-form" onSubmit={handleDeploy}>
          <div className="form-group">
            <label>Token Name</label>
            <input
              type="text"
              placeholder="Example: MyToken"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Token Symbol</label>
            <input
              type="text"
              placeholder="Example: MTK"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Total Supply</label>
            <input
              type="number"
              placeholder="Example: 1000000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={deploying}>
            {deploying ? 'Deploying...' : 'Deploy Token'}
          </button>
        </form>

        {deployedAddress && (
          <div className="deployed-result">
            Contract Address: <code>{deployedAddress}</code>
          </div>
        )}
      </div>
    </section>
  );
}
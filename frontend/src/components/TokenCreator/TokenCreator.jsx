import React, { useState } from 'react';
import { Rocket, Check, Copy, ExternalLink } from 'lucide-react';
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

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(deployedAddress);
      toast.success('Address copied');
    } catch {
      toast.error('Could not copy address');
    }
  };

  return (
    <section className="section token-creator-section" id="token-deployer">
      <div className="container token-creator-grid">
        <div className="token-creator-copy">
          <span className="icon-tile accent"><Rocket size={20} /></span>
          <h2 className="section-title">Deploy your own token</h2>
          <p className="section-sub">
            Launch a standard ERC-20 on Sepolia straight from your wallet. Name it, set the supply, and sign one transaction.
          </p>
          <ul className="token-creator-points">
            <li><Check size={16} /> Fixed supply minted to your wallet</li>
            <li><Check size={16} /> 18 decimals, standard ERC-20 interface</li>
            <li><Check size={16} /> Testnet only, no real funds at risk</li>
          </ul>
        </div>

        <div className="token-creator-panel">
          <form className="card token-creator-form" onSubmit={handleDeploy}>
            <div className="form-group">
              <label htmlFor="tc-name">Token name</label>
              <input
                id="tc-name"
                type="text"
                placeholder="MyToken"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tc-symbol">Symbol</label>
                <input
                  id="tc-symbol"
                  type="text"
                  placeholder="MTK"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tc-supply">Total supply</label>
                <input
                  id="tc-supply"
                  type="number"
                  placeholder="1000000"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={deploying}>
              {deploying ? <><span className="spinner" /> Deploying…</> : <><Rocket size={16} /> Deploy token</>}
            </button>
          </form>

          {deployedAddress && (
            <div className="deployed-result">
              <div className="deployed-label"><Check size={14} /> Deployed</div>
              <code>{deployedAddress}</code>
              <div className="deployed-actions">
                <button type="button" className="icon-btn" onClick={copyAddress} aria-label="Copy contract address"><Copy size={16} /></button>
                <a className="icon-btn" href={`https://sepolia.etherscan.io/address/${deployedAddress}`} target="_blank" rel="noreferrer" aria-label="View on Etherscan"><ExternalLink size={16} /></a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

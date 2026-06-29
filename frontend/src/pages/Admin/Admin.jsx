import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import { getBetContract } from '../../utils/contracts';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/users/admin-login/', creds);
      localStorage.setItem('rc_token', res.data.access);
      localStorage.setItem('rc_refresh', res.data.refresh);
      onLogin(res.data.user);
      toast.success('Welcome, Admin!');
    } catch {
      toast.error('Invalid credentials or not an admin');
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <div className="container">
        <motion.div
          className="admin-login-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-login-icon">🔐</div>
          <h2>Admin Login</h2>
          <p className="admin-login-sub">Enter your Django superuser credentials</p>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="admin username"
                value={creds.username}
                onChange={e => setCreds(c => ({ ...c, username: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={creds.password}
                onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { account, signer } = useWallet();
  const [adminUser, setAdminUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', points_reward: 100,
    team1_name: 'Team 1', team2_name: 'Team 2',
    on_chain_match_id: 1, image: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('rc_token');
    if (token) {
      api.get('/users/profile/').then(r => {
        if (r.data.is_staff) {
          setAdminUser(r.data);
          fetchMatches();
        } else {
          setLoading(false);
        }
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMatches = () => {
    api.get('/bets/').then(r => { setMatches(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  const handleLogin = (user) => {
    setAdminUser(user);
    fetchMatches();
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_refresh');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!signer) { toast.error('Connect your wallet first'); return; }
    setCreating(true);
    try {
      // Step 1: Create match ON-CHAIN and get the matchId
      const contract = getBetContract(signer);
      const toastId = toast.loading('Step 1/2: Creating match on-chain…');
      let onChainMatchId;
      try {
        const tx = await contract.createMatch();
        toast.loading('Waiting for confirmation…', { id: toastId });
        const receipt = await tx.wait();
        // Parse MatchCreated event to get matchId
        const event = receipt.logs
          .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
          .find(e => e && e.name === 'MatchCreated');
        onChainMatchId = event ? Number(event.args.matchId) : null;
        if (!onChainMatchId) throw new Error('Could not read matchId from event');
        toast.dismiss(toastId);
        toast.success(`On-chain match created! ID: ${onChainMatchId}`);
      } catch (chainErr) {
        toast.dismiss(toastId);
        if (chainErr.code === 4001) { toast.error('Transaction rejected'); setCreating(false); return; }
        throw chainErr;
      }

      // Step 2: Save to backend with the real on_chain_match_id
      toast.loading('Step 2/2: Saving to database…', { id: 'saving' });
      const fd = new FormData();
      Object.entries({ ...form, on_chain_match_id: onChainMatchId })
        .forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      await api.post('/bets/create/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.dismiss('saving');
      toast.success(`Match "${form.title}" created! On-chain ID: ${onChainMatchId}`);
      setForm({ title: '', description: '', points_reward: 100, team1_name: 'Team 1', team2_name: 'Team 2', on_chain_match_id: '', image: null });
      fetchMatches();
    } catch (err) {
      toast.dismiss('saving');
      toast.error(err.response?.data?.detail || err.message || 'Failed to create match');
    }
    setCreating(false);
  };

  const handleResolve = async (matchId, result) => {
    try {
      const res = await api.post(`/bets/${matchId}/resolve/`, { result });
      toast.success(res.data.message);
      fetchMatches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resolve');
    }
  };

  if (!adminUser) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="admin-top-bar">
            <div>
              <h1 className="section-title">Admin Panel</h1>
              <p className="section-subtitle">Logged in as <strong>{adminUser.username}</strong></p>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </motion.div>

        <div className="admin-layout">
          {/* Create Match */}
          <div className="card admin-form-card">
            <h2 className="admin-section-title">Create New Match</h2>
            <form onSubmit={handleCreate} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required className="form-input" placeholder="Match title" />
                </div>
                <div className="form-group">
                  <label>Points Reward</label>
                  <input name="points_reward" type="number" value={form.points_reward} onChange={handleChange} className="form-input" min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-input form-textarea" placeholder="Match description…" rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Team 1 Name</label>
                  <input name="team1_name" value={form.team1_name} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Team 2 Name</label>
                  <input name="team2_name" value={form.team2_name} onChange={handleChange} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Match Image</label>
                <input name="image" type="file" accept="image/*" onChange={handleChange} className="form-input form-file" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating} style={{ width: '100%', justifyContent: 'center' }}>
                {creating ? 'Creating…' : '+ Create Match'}
              </button>
            </form>
          </div>

          {/* Existing Matches */}
          <div className="admin-matches">
            <h2 className="admin-section-title">Existing Matches</h2>
            {loading ? (
              <div className="loading-state">Loading…</div>
            ) : matches.length === 0 ? (
              <div className="empty-state">No matches yet.</div>
            ) : matches.map(match => (
              <motion.div key={match.id} className="card admin-match-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="admin-match-header">
                  <div>
                    <h3>{match.title}</h3>
                    <span className={`badge badge-${match.status === 'open' ? 'success' : match.status === 'resolved' ? 'accent' : 'warning'}`}>
                      {match.status}
                    </span>
                  </div>
                  <span className="match-points-badge">+{match.points_reward} pts</span>
                </div>

                <div className="admin-match-teams">
                  <span>{match.team1_name}</span>
                  <span className="vs-text">vs</span>
                  <span>{match.team2_name}</span>
                </div>

                <div className="vote-stats">
                  <span>Team 1: {match.vote_percentages?.team1 ?? 0}%</span>
                  <span>Draw: {match.vote_percentages?.draw ?? 0}%</span>
                  <span>Team 2: {match.vote_percentages?.team2 ?? 0}%</span>
                  <span className="total-votes">({match.vote_percentages?.total ?? 0} votes)</span>
                </div>

                {match.result && (
                  <div className="admin-result-tag">
                    Result: <strong>{match.result}</strong>
                  </div>
                )}

                {match.status === 'open' && (
                  <div className="resolve-actions">
                    <p className="resolve-label">Resolve as:</p>
                    <div className="resolve-btns">
                      <button className="btn btn-secondary resolve-btn" onClick={() => handleResolve(match.id, 'team1')}>
                        {match.team1_name} Win
                      </button>
                      <button className="btn btn-secondary resolve-btn" onClick={() => handleResolve(match.id, 'draw')}>
                        Draw
                      </button>
                      <button className="btn btn-secondary resolve-btn" onClick={() => handleResolve(match.id, 'team2')}>
                        {match.team2_name} Win
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Copy, Github, Pencil, LogOut, Wallet, Coins } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { EmptyState, XIcon } from '../../components/ui';
import './Profile.css';

export default function ProfilePage() {
  const { account, user, setUser, disconnect } = useWallet();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    twitter_link: user?.twitter_link || '',
    github_link: user?.github_link || '',
  });
  const fileRef = useRef(null);

  if (!account) {
    return (
      <div className="profile-page page">
        <div className="container">
          <EmptyState icon={Wallet} title="Wallet not connected">
            Connect your wallet to view and edit your profile.
          </EmptyState>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('username', form.username);
      if (form.twitter_link) formData.append('twitter_link', form.twitter_link);
      if (form.github_link) formData.append('github_link', form.github_link);
      const res = await api.patch('/users/profile/', formData);
      setUser(res.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.patch('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to update avatar');
    }
  };

  const shortWallet = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(account);
      toast.success('Address copied');
    } catch {
      toast.error('Could not copy address');
    }
  };

  return (
    <div className="profile-page page">
      <div className="container">
        <motion.div
          className="profile-layout"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="profile-card card">
            <div className="profile-avatar-section">
              <button
                type="button"
                className="profile-avatar-wrapper"
                onClick={() => fileRef.current?.click()}
                aria-label="Change avatar"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">{shortWallet.slice(2, 4)}</div>
                )}
                <span className="avatar-edit-overlay"><Camera size={22} /></span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="profile-info">
              {editing ? (
                <div className="profile-edit-form">
                  <div className="form-group">
                    <label htmlFor="pf-username">Username</label>
                    <input id="pf-username" name="username" value={form.username} onChange={handleChange} className="form-input" placeholder="Your username" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pf-twitter">X / Twitter</label>
                    <input id="pf-twitter" name="twitter_link" value={form.twitter_link} onChange={handleChange} className="form-input" placeholder="https://x.com/yourhandle" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pf-github">GitHub</label>
                    <input id="pf-github" name="github_link" value={form.github_link} onChange={handleChange} className="form-input" placeholder="https://github.com/yourhandle" />
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? <><span className="spinner" /> Saving…</> : 'Save changes'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="profile-username">{user?.username || shortWallet}</h1>

                  <div className="profile-wallet">
                    <span className="profile-wallet-addr mono">{account}</span>
                    <button type="button" className="icon-btn" onClick={copyWallet} aria-label="Copy wallet address"><Copy size={15} /></button>
                  </div>

                  <div className="profile-actions">
                    <button className="btn btn-secondary" onClick={() => {
                      setForm({ username: user?.username || '', twitter_link: user?.twitter_link || '', github_link: user?.github_link || '' });
                      setEditing(true);
                    }}>
                      <Pencil size={15} /> Edit profile
                    </button>
                    <button className="btn btn-danger" onClick={() => { disconnect(); navigate('/'); }}>
                      <LogOut size={15} /> Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="profile-side">
            <div className="card profile-points-card">
              <span className="profile-side-label"><Coins size={15} /> Points</span>
              <div className="profile-points-big">
                <span className="points-number num">{(user?.points ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="card profile-links-card">
              <span className="profile-side-label">Links</span>
              <div className="profile-links">
                {user?.twitter_link && (
                  <a href={user.twitter_link} target="_blank" rel="noreferrer" className="profile-link twitter"><XIcon size={16} /> X / Twitter</a>
                )}
                {user?.github_link && (
                  <a href={user.github_link} target="_blank" rel="noreferrer" className="profile-link github"><Github size={16} /> GitHub</a>
                )}
                {!user?.twitter_link && !user?.github_link && (
                  <p className="profile-no-links">No social links added yet.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

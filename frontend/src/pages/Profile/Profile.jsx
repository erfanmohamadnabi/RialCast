import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
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
      <div className="profile-page">
        <div className="container">
          <div className="empty-state">
            <p>Connect your wallet to view your profile.</p>
          </div>
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
      toast.success('Profile updated!');
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
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to update avatar');
    }
  };

  const shortWallet = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          className="profile-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Avatar */}
          <div className="profile-avatar-section">
            <div
              className="profile-avatar-wrapper"
              onClick={() => fileRef.current?.click()}
              title="Click to change avatar"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {shortWallet.slice(0, 2)}
                </div>
              )}
              <div className="avatar-edit-overlay">
                
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="50">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>

              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Info */}
          <div className="profile-info">
            {editing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Your username"
                  />
                </div>
                <div className="form-group">
                  <label>Twitter / X</label>
                  <input
                    name="twitter_link"
                    value={form.twitter_link}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://x.com/yourhandle"
                  />
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  <input
                    name="github_link"
                    value={form.github_link}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://github.com/yourhandle"
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-username">{user?.username || shortWallet}</h1>

                <div className="profile-wallet">
                  <span className="profile-wallet-label">Wallet</span>
                  <span className="profile-wallet-addr">{account}</span>
                </div>

                <div className="profile-points-big">
                  <span className="points-number">{user?.points ?? 0}</span>
                  <span className="points-text">points</span>
                </div>

                <div className="profile-links">
                  {user?.twitter_link && (
                    <a href={user.twitter_link} target="_blank" rel="noreferrer" className="profile-link twitter">
                      
                      <svg fill="white" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30">
                        <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
                      </svg>

                      Twitter / X
                    </a>
                  )}
                  {user?.github_link && (
                    <a href={user.github_link} target="_blank" rel="noreferrer" className="profile-link github">
                      💻 GitHub
                    </a>
                  )}
                  {!user?.twitter_link && !user?.github_link && (
                    <p className="profile-no-links">No social links added yet</p>
                  )}
                </div>

                <div className="profile-actions">
                  <button className="btn btn-secondary" onClick={() => {
                    setForm({ username: user?.username || '', twitter_link: user?.twitter_link || '', github_link: user?.github_link || '' });
                    setEditing(true);
                  }}>
                    Edit Profile
                  </button>
                  <button className="btn btn-danger" onClick={() => { disconnect(); navigate('/'); }}>
                    Disconnect
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

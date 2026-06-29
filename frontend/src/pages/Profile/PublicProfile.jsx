import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import './Profile.css';

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/profile/${id}/`)
      .then(r => { setProfile(r.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/leaderboard'); });
  }, [id, navigate]);

  if (loading) return <div className="profile-page"><div className="container"><div className="loading-state">Loading…</div></div></div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          className="profile-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper" style={{ cursor: 'default' }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.username?.slice(0, 2) || '?'}
                </div>
              )}
            </div>
          </div>

          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>

            <div className="profile-points-big">
              <span className="points-number">{profile.points ?? 0}</span>
              <span className="points-text">points</span>
            </div>

            <div className="profile-links">
              {profile.twitter_link && (
                <a href={profile.twitter_link} target="_blank" rel="noreferrer" className="profile-link twitter">
                  
                  <svg fill="white" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30">
                      <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
                  </svg>

                  Twitter / X
                </a>
              )}
              {profile.github_link && (
                <a href={profile.github_link} target="_blank" rel="noreferrer" className="profile-link github">
                  💻 GitHub
                </a>
              )}
              {!profile.twitter_link && !profile.github_link && (
                <p className="profile-no-links">No social links added</p>
              )}
            </div>

            <div className="profile-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
                ← Back to Leaderboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

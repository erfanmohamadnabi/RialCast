import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Coins } from 'lucide-react';
import api from '../../utils/api';
import { LoadingState, XIcon } from '../../components/ui';
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

  if (loading) return <div className="profile-page page"><div className="container"><LoadingState label="Loading profile…" /></div></div>;
  if (!profile) return null;

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
              <div className="profile-avatar-wrapper static">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">{profile.username?.slice(0, 2) || '?'}</div>
                )}
              </div>
            </div>

            <div className="profile-info">
              <h1 className="profile-username">{profile.username}</h1>
              <div className="profile-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
                  <ArrowLeft size={15} /> Back to leaderboard
                </button>
              </div>
            </div>
          </div>

          <div className="profile-side">
            <div className="card profile-points-card">
              <span className="profile-side-label"><Coins size={15} /> Points</span>
              <div className="profile-points-big">
                <span className="points-number num">{(profile.points ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="card profile-links-card">
              <span className="profile-side-label">Links</span>
              <div className="profile-links">
                {profile.twitter_link && (
                  <a href={profile.twitter_link} target="_blank" rel="noreferrer" className="profile-link twitter"><XIcon size={16} /> X / Twitter</a>
                )}
                {profile.github_link && (
                  <a href={profile.github_link} target="_blank" rel="noreferrer" className="profile-link github"><Github size={16} /> GitHub</a>
                )}
                {!profile.twitter_link && !profile.github_link && (
                  <p className="profile-no-links">No social links added.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

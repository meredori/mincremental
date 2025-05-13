// src/components/GlobalHeader.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * GlobalHeader
 * Props:
 * - user: { avatarUrl, username, level }
 * - onBack: function
 */
function GlobalHeader({ user, onBack }) {
  return (
    <header className="global-header" style={{
      background: '#fff',
      borderBottom: '2px solid var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      boxShadow: '0 2px 8px var(--shadow)',
      minHeight: '64px',
      zIndex: 10
    }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src={user?.avatarUrl || "/assets/default-avatar.png"}
          alt="User Avatar"
          className="user-avatar"
          style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--accent)', background: '#f5f5f5' }}
        />
        <span className="username" style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem' }}>{user?.username || "Guest"}</span>
        <span className="user-level" style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginLeft: 4 }}>{user?.level ? `Lv. ${user.level}` : ""}</span>
      </div>
      <div className="header-right">
        <button className="back-btn cartoon-button" onClick={onBack} style={{ fontSize: '1rem', padding: '0.5rem 1.2rem' }}>
          Back to Game Selection
        </button>
      </div>
    </header>
  );
}

GlobalHeader.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    username: PropTypes.string,
    level: PropTypes.number,
  }),
  onBack: PropTypes.func.isRequired,
};

export default GlobalHeader;
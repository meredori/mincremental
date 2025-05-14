// src/components/GlobalFooter.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * GlobalFooter
 * Props:
 * - version: string
 * - links: array of { label, href }
 */
function GlobalFooter({ version }) {
  return (
    <footer className="global-footer" style={{
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      background: '#fff',
      borderTop: '2px solid var(--accent)',
      color: 'var(--text)',
      textAlign: 'center',
      fontSize: '0.98em',
      letterSpacing: '0.02em',
      padding: '1.2rem 0 0.7rem 0',
      boxShadow: '0 -2px 8px var(--shadow)',
      zIndex: 100
    }}>
      <div className="footer-links" style={{ marginBottom: 6 }}>
        <a
          href="https://github.com/meredori/mincremental"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--primary)',
            margin: '0 0.7em',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
        >
          GitHub
        </a>
      </div>
      <div className="footer-version" style={{ color: 'var(--secondary)', fontSize: '0.93em' }}>
        {version && <span>v{version}</span>}
      </div>
    </footer>
  );
}

GlobalFooter.propTypes = {
  version: PropTypes.string
};

export default GlobalFooter;
import React from 'react';

const GameSelector = ({ games = [], onSelect }) => {
  return (
    <div className="game-selector">
      <div className="game-selector-container">
        <h2 className="game-selector-title">
          Choose Your Adventure!
        </h2>

        <div className="game-selector-grid">
          {games.map((game) => {
            const accentColor = game.palette?.accent || 'var(--color-accent)';
            const icon = game.icon || '🎮';

            return (
              <button
                key={game.id}
                type="button"
                className="game-selector-item"
                style={{ borderColor: accentColor }}
                onClick={() => onSelect?.(game.id)}
              >
                <div className="game-selector-item-content">
                  <span className="game-icon" aria-hidden="true" style={{ color: accentColor }}>
                    {icon}
                  </span>
                  <h3>{game.title}</h3>
                  <p>{game.blurb}</p>
                  <span className="cartoon-button" style={{ background: accentColor }}>
                    Let's Play!
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameSelector;

import React from 'react';

const defaultGames = [
  {
    id: 'cartoon1',
    name: 'Color Splash',
    description: 'Paint your way to victory!',
    color: '#ff6b6b',
    icon: '🎨'
  },
  {
    id: 'cartoon2',
    name: 'Bubble Pop',
    description: 'Pop bubbles of fun!',
    color: '#4ecdc4',
    icon: '🫧'
  },
  {
    id: 'cartoon3',
    name: 'Sweet Adventure',
    description: 'A delicious puzzle journey',
    color: '#ffe66d',
    icon: '🍭'
  }
];

const BounceEffect = ({ children }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      {children}
    </div>
  );
};

const GameSelector = ({ games = defaultGames, onSelect }) => {
  const displayGames = games.slice(0, 9);
  const [activeGame, setActiveGame] = React.useState(null);

  const handleGameClick = (gameId) => {
    setActiveGame(gameId);
    onSelect(gameId);
  };

  const createBubble = () => {
    const bubble = document.createElement('div');
    bubble.className = 'cartoon-bubble';
    bubble.style.cssText = `
      position: fixed;
      width: ${Math.random() * 50 + 20}px;
      height: ${Math.random() * 50 + 20}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      left: ${Math.random() * window.innerWidth}px;
      bottom: -50px;
      animation: floatBubble ${Math.random() * 4 + 3}s linear forwards;
      z-index: 1;
    `;
    
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 7000);
  };

  React.useEffect(() => {
    const interval = setInterval(createBubble, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="game-selector">
      <div className="game-selector-container">
        <h2 className="game-selector-title">
          Choose Your Adventure!
        </h2>
        
        <div className="game-selector-grid">
          {displayGames.map((game) => (
            <div
              key={game.id}
              className="game-selector-item"
              onClick={() => handleGameClick(game.id)}
            >
              <div className="game-selector-item-content">
                <BounceEffect>
                  <span className="game-icon">{game.icon}</span>
                </BounceEffect>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <button className="cartoon-button">
                  Let's Play!
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes floatBubble {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GameSelector;

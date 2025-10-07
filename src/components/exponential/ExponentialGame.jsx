import React, { useCallback, useEffect, useMemo, useState } from "react";
import Scoreboard from "../shared/Scoreboard.jsx";
import "./exponential.css";
import { loadGameState, saveGameState } from "../../utils/saveSystem.js";

const DEFAULT_STATE = {
  score: 1,
  increment: [{ cost: 1, amount: 1, total: 0 }],
  timer: 2000,
};

const EXPONENTIAL_GAME_ID = "exponential";

const cloneIncrementers = (incrementers) => incrementers.map((inc) => ({ ...inc }));

function ExponentialGame() {
  const [gameState, setGameState] = useState(() => ({
    ...DEFAULT_STATE,
    increment: cloneIncrementers(DEFAULT_STATE.increment),
  }));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = loadGameState(EXPONENTIAL_GAME_ID);
    if (savedState) {
      setGameState({
        ...DEFAULT_STATE,
        ...savedState,
        increment: savedState.increment ? cloneIncrementers(savedState.increment) : DEFAULT_STATE.increment,
      });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    saveGameState(EXPONENTIAL_GAME_ID, gameState);
  }, [gameState, isHydrated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prevState) => {
        const nextIncrement = cloneIncrementers(prevState.increment);
        let updatedScore = prevState.score + (nextIncrement[0]?.total ?? 0);

        for (let index = nextIncrement.length - 1; index > 0; index -= 1) {
          const downstream = nextIncrement[index];
          const upstream = nextIncrement[index - 1];
          upstream.total += downstream.amount * downstream.total;
        }

        return {
          ...prevState,
          score: updatedScore,
          increment: nextIncrement,
        };
      });
    }, gameState.timer);

    return () => clearInterval(interval);
  }, [gameState.timer]);

  const handleIncrementPurchase = useCallback((index) => {
    setGameState((prevState) => {
      const target = prevState.increment[index];
      if (!target || prevState.score < target.cost) {
        return prevState;
      }

      const updatedScore = prevState.score - target.cost;
      const updatedIncrement = cloneIncrementers(prevState.increment);
      const current = updatedIncrement[index];

      if (current.total === 0) {
        updatedIncrement.push({ cost: current.cost * 10, amount: 1, total: 0 });
      }

      current.cost = Math.ceil(current.cost * 1.2);
      current.total += current.amount;

      return {
        ...prevState,
        score: updatedScore,
        increment: updatedIncrement,
      };
    });
  }, []);

  const incrementers = useMemo(() => gameState.increment, [gameState.increment]);

  return (
    <div className="game-exponential">
      <h2>Exponential Ticker</h2>
      <Scoreboard score={gameState.score} title="Resources" />
      <div className="exponential-incrementers">
        {incrementers.map((incrementer, index) => (
          <div key={`incrementer-${index}`} className="exponential-incrementer-card">
            <div className="exponential-incrementer-header">
              <h3>Tier {index + 1}</h3>
              <p>Generates {incrementer.amount} of tier {index === 0 ? "base" : index} per tick</p>
            </div>
            <div className="exponential-incrementer-body">
              <div className="exponential-incrementer-stat">
                <span className="label">Owned</span>
                <span className="value">{incrementer.total}</span>
              </div>
              <div className="exponential-incrementer-stat">
                <span className="label">Cost</span>
                <span className="value">{incrementer.cost}</span>
              </div>
            </div>
            <button
              type="button"
              className="cartoon-button"
              onClick={() => handleIncrementPurchase(index)}
              disabled={gameState.score < incrementer.cost}
            >
              Purchase Tier {index + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExponentialGame;

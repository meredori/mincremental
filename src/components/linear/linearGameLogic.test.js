import {
  initializeGame,
  purchaseIncrementer,
  castLight,
} from './linearGameLogic';
import { glimmerglassTiers } from './data/glimmerglassTiers';

jest.mock('./upgradeEngine.js', () => ({
  getAllUpgradeDefinitions: jest.fn(),
}));

describe('glimmerglass linear game logic', () => {
  test('castLight grants manual lumens and tracks lifetime harvest', () => {
    const gameState = initializeGame();
    const manualCast = gameState.metadata.manualLumensPerCast;
    const startingScore = gameState.score;
    const startingLifetime = gameState.statistics.lifetimeLumens;

    castLight(gameState);

    expect(gameState.score).toBe(startingScore + manualCast);
    expect(gameState.statistics.lifetimeLumens).toBe(startingLifetime + manualCast);
  });

  test('tiers unlock when lifetime lumens threshold is reached', () => {
    const gameState = initializeGame();
    const nextTier = glimmerglassTiers.find((tier) => tier.unlockThreshold > 0);
    const lockedIncrementer = gameState.incrementers.find((inc) => inc.id === nextTier.id);

    expect(lockedIncrementer.isUnlocked).toBe(false);

    const manualCast = gameState.metadata.manualLumensPerCast;
    const castsNeeded = Math.ceil(
      (nextTier.unlockThreshold - gameState.statistics.lifetimeLumens) / manualCast
    );

    for (let i = 0; i < castsNeeded; i += 1) {
      castLight(gameState);
    }

    const unlockedIncrementer = gameState.incrementers.find((inc) => inc.id === nextTier.id);
    expect(unlockedIncrementer.isUnlocked).toBe(true);
    expect(unlockedIncrementer.individualProductionValue).toBe(unlockedIncrementer.baseValue);
  });

  test('total lumens per second reflects purchased artisans', () => {
    const gameState = initializeGame();

    gameState.statistics.lifetimeLumens = 10000;
    gameState.score = 10000;
    castLight(gameState);
    gameState.score = 20000;

    const sparkId = glimmerglassTiers[0].id;
    const prismId = glimmerglassTiers[1].id;

    purchaseIncrementer(gameState, sparkId);
    purchaseIncrementer(gameState, sparkId);
    purchaseIncrementer(gameState, sparkId);
    purchaseIncrementer(gameState, prismId);
    purchaseIncrementer(gameState, prismId);

    const sparkState = gameState.incrementers.find((inc) => inc.id === sparkId);
    const prismState = gameState.incrementers.find((inc) => inc.id === prismId);

    expect(sparkState.count).toBe(3);
    expect(prismState.count).toBe(2);

    const expectedTotal = sparkState.count * sparkState.individualProductionValue
      + prismState.count * prismState.individualProductionValue;

    expect(gameState.totalPerSecond).toBe(expectedTotal);
  });
});

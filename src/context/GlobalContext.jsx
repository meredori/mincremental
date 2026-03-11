// src/context/GlobalContext.jsx
// Thin provider that hydrates the Zustand global store from localStorage on mount.
// Games consume the store directly via useGlobalStore() — no React context consumers needed.

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useGlobalStore from '../store/globalStore.js';
import { evaluateGlobalAchievements } from '../meta/achievements.js';

export function GlobalProvider({ children }) {
  const loadFromSave = useGlobalStore((s) => s.loadFromSave);
  const awardAchievement = useGlobalStore((s) => s.awardAchievement);
  const achievements = useGlobalStore((s) => s.achievements);
  const prestigeCounts = useGlobalStore((s) => s.prestigeCounts);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    loadFromSave();
  }, [loadFromSave]);

  // Evaluate cross-game 'any'-source achievements whenever prestige counts change
  useEffect(() => {
    const globalState = useGlobalStore.getState();
    const newIds = evaluateGlobalAchievements(globalState, achievements);
    newIds.forEach((id) => awardAchievement(id));
  }, [prestigeCounts, achievements, awardAchievement]);

  return <>{children}</>;
}

GlobalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import LinearGame from './LinearGame';
import MockUpgradeButton from '../shared/UpgradeButton';
import * as linearGameLogic from './linearGameLogic';
import * as upgradeEngine from './upgradeEngine';

// Mock child components to isolate LinearGame logic
jest.mock('../shared/Incrementer', () => (props) => <div data-testid={`incrementer-${props.id}`} />);

// Enhanced mock for UpgradeButton to inspect props.
// Defined inside the factory so jest.mock hoisting doesn't cause TDZ errors.
// Uses the actual prop names LinearGame passes: upgrade (not upgradeDef), no isPurchased prop.
jest.mock('../shared/UpgradeButton', () => {
  const MockComponent = jest.fn((props) => (
    <button
      data-testid={`upgrade-${props.upgrade?.id}`}
      onClick={() => props.onPurchase && props.onPurchase()}
      disabled={props.disabled}
    >
      {props.upgrade?.name}
      {props.affectedName && ` (Affects: ${props.affectedName})`}
      {props.upgrade?.purchased ? ' (Purchased)' : ''}
    </button>
  ));
  return MockComponent;
});

jest.mock('../shared/Tooltip', () => ({ children }) => <div>{children}</div>);

// Prevent localStorage from bleeding state between tests
jest.mock('../../utils/saveSystem.js', () => ({
  loadGameState: jest.fn().mockReturnValue(null),
  saveGameState: jest.fn(),
  resetGameState: jest.fn(),
}));


// Mock game logic and upgrade engine functions
const mockInitialGameState = {
  score: 100,
  totalPerSecond: 10,
  incrementers: [
    { id: 'thingamabob', name: 'Thingamabob', count: 1, currentCost: 10, baseValue: 1, individualProductionValue: 1, totalProductionFromType: 1, upgrades: { multiplier: 1, flatBonus: 0 } },
    { id: 'widget', name: 'Widget', count: 2, currentCost: 20, baseValue: 5, individualProductionValue: 5, totalProductionFromType: 10, upgrades: { multiplier: 1, flatBonus: 0 } },
  ],
  upgrades: {},
  purchasedUpgrades: [],
  settings: { showPurchased: false },
};

// Effect types match what LinearGame.jsx's inline calc recognises: FLAT_BONUS, MULTIPLIER, GLOBAL_MULTIPLIER
const mockUpgradeDefinitions = {
  'upg_thing':     { id: 'upg_thing',     name: 'Thing Upgrade',     cost: 10, description: 'Boosts Thingamabobs', effects: [{ type: 'FLAT_BONUS',       value: 5,   targetId: 'thingamabob' }] },
  'upg_widget':    { id: 'upg_widget',    name: 'Widget Enhancer',   cost: 20, description: 'Improves Widgets',   effects: [{ type: 'MULTIPLIER',       value: 2,   targetId: 'widget'      }] },
  'upg_global':    { id: 'upg_global',    name: 'Global Boost',      cost: 50, description: 'Boosts All',         effects: [{ type: 'GLOBAL_MULTIPLIER', value: 1.5, targetId: 'GLOBAL'      }] },
  'upg_purchased': { id: 'upg_purchased', name: 'Purchased Upgrade', cost: 5,  description: 'Already got it',    effects: [{ type: 'FLAT_BONUS',       value: 1,   targetId: 'thingamabob' }] },
};

const mockDynamicAvailableUpgrades = [
  { ...mockUpgradeDefinitions.upg_thing,     isAffordable: true },
  { ...mockUpgradeDefinitions.upg_widget,    isAffordable: true },
  { ...mockUpgradeDefinitions.upg_global,    isAffordable: true },
  { ...mockUpgradeDefinitions.upg_purchased, isAffordable: true },
];


jest.spyOn(linearGameLogic, 'initializeGame').mockReturnValue(JSON.parse(JSON.stringify(mockInitialGameState)));
jest.spyOn(linearGameLogic, 'purchaseIncrementer').mockImplementation(gs => gs);
jest.spyOn(linearGameLogic, 'applyUpgrade').mockImplementation((gs, upgradeId) => {
    const def = mockUpgradeDefinitions[upgradeId];
    if (def && gs.score >= def.cost && !gs.purchasedUpgrades.includes(upgradeId)) {
      return { ...gs, purchasedUpgrades: [...gs.purchasedUpgrades, upgradeId], score: gs.score - def.cost };
    }
    return gs;
});
jest.spyOn(linearGameLogic, 'updateGameTick').mockImplementation(gs => gs);
jest.spyOn(upgradeEngine, 'getAllUpgradeDefinitions').mockReturnValue(mockUpgradeDefinitions);

jest.spyOn(upgradeEngine, 'getAvailableUpgrades').mockImplementation((gs) => {
    return mockDynamicAvailableUpgrades.map(upg => ({
        ...upg,
        isAffordable: gs.score >= upg.cost,
    }));
});


describe('LinearGame Component', () => {
  beforeEach(() => {
    MockUpgradeButton.mockClear();
    linearGameLogic.initializeGame.mockClear().mockReturnValue(JSON.parse(JSON.stringify(mockInitialGameState)));
    linearGameLogic.applyUpgrade.mockClear().mockImplementation((gs, upgradeId) => {
      const def = mockUpgradeDefinitions[upgradeId];
      if (def && gs.score >= def.cost && !gs.purchasedUpgrades.includes(upgradeId)) {
        return { ...gs, purchasedUpgrades: [...gs.purchasedUpgrades, upgradeId], score: gs.score - def.cost };
      }
      return gs;
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('passes correct props to UpgradeButton instances', () => {
    render(<LinearGame />);

    expect(MockUpgradeButton).toHaveBeenCalled();

    const calls = MockUpgradeButton.mock.calls;

    // LinearGame.jsx inline calc for FLAT_BONUS on thingamabob (baseValue=1, flatBonus=0, multiplier=1):
    //   currentProduction = individualProductionValue = 1
    //   newProduction = Math.floor((1 + 5) * 1) = 6
    const thingProps = calls.find(call => call[0].upgrade.id === 'upg_thing')[0];
    expect(thingProps).toBeDefined();
    expect(thingProps.upgrade.name).toBe('Thing Upgrade');
    expect(thingProps.affectedName).toBe('Thingamabob');
    expect(thingProps.currentProduction).toBe(1);
    expect(thingProps.newProduction).toBe(6);
    expect(thingProps.upgrade.purchased).toBe(false);
    expect(thingProps.disabled).toBe(false); // score 100, cost 10

    // LinearGame.jsx inline calc for MULTIPLIER on widget (baseValue=5, flatBonus=0, multiplier=1):
    //   currentProduction = individualProductionValue = 5
    //   newProduction = Math.floor((5 + 0) * 2) = 10
    const widgetProps = calls.find(call => call[0].upgrade.id === 'upg_widget')[0];
    expect(widgetProps).toBeDefined();
    expect(widgetProps.upgrade.name).toBe('Widget Enhancer');
    expect(widgetProps.affectedName).toBe('Widget');
    expect(widgetProps.currentProduction).toBe(5);
    expect(widgetProps.newProduction).toBe(10);
    expect(widgetProps.upgrade.purchased).toBe(false);
    expect(widgetProps.disabled).toBe(false); // score 100, cost 20

    // LinearGame.jsx hardcodes currentProduction=0 / newProduction=0 for GLOBAL effects
    const globalProps = calls.find(call => call[0].upgrade.id === 'upg_global')[0];
    expect(globalProps).toBeDefined();
    expect(globalProps.upgrade.name).toBe('Global Boost');
    expect(globalProps.affectedName).toBe('All Incrementers');
    expect(globalProps.currentProduction).toBe(0);
    expect(globalProps.newProduction).toBe(0);
    expect(globalProps.upgrade.purchased).toBe(false);
    expect(globalProps.disabled).toBe(false); // score 100, cost 50

    const initialPurchasedProps = calls.find(call => call[0].upgrade.id === 'upg_purchased')[0];
    expect(initialPurchasedProps).toBeDefined();
    expect(initialPurchasedProps.upgrade.purchased).toBe(false);
    expect(initialPurchasedProps.disabled).toBe(false); // score 100, cost 5
  });

  test('REQ-003: "Show Purchased" checkbox controls visibility of purchased upgrades', async () => {
    render(<LinearGame />);

    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_purchased')).toBeInTheDocument();

    act(() => {
        fireEvent.click(screen.getByTestId('upgrade-upg_purchased'));
    });

    // After purchase, showPurchased=false → purchased upgrade hidden
    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-upg_purchased')).not.toBeInTheDocument();

    const thingPropsAfterPurchase = MockUpgradeButton.mock.calls.find(call => call[0].upgrade.id === 'upg_thing')[0];
    expect(thingPropsAfterPurchase.upgrade.purchased).toBe(false);

    const checkbox = screen.getByLabelText(/Show Purchased/i);
    act(() => { fireEvent.click(checkbox); });

    // showPurchased=true → all upgrades visible
    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_purchased')).toBeInTheDocument();

    // Use the most recent call for upg_purchased (earlier calls have purchased=false)
    const allPurchasedCalls = MockUpgradeButton.mock.calls.filter(call => call[0].upgrade.id === 'upg_purchased');
    const purchasedButtonProps = allPurchasedCalls[allPurchasedCalls.length - 1][0];
    expect(purchasedButtonProps.upgrade.purchased).toBe(true);
    expect(purchasedButtonProps.disabled).toBe(true);

    act(() => { fireEvent.click(checkbox); });
    expect(screen.queryByTestId('upgrade-upg_purchased')).not.toBeInTheDocument();
  });

  test('Initial state of "Show Purchased" checkbox reflects gameState', () => {
    render(<LinearGame />);
    const checkbox = screen.getByLabelText(/Show Purchased/i);
    expect(checkbox.checked).toBe(false);

    // Clean up first render then re-render with showPurchased: true
    cleanup();
    const trueInitialState = { ...mockInitialGameState, settings: { ...mockInitialGameState.settings, showPurchased: true } };
    linearGameLogic.initializeGame.mockReturnValueOnce(JSON.parse(JSON.stringify(trueInitialState)));
    MockUpgradeButton.mockClear();
    render(<LinearGame />);
    expect(screen.getByLabelText(/Show Purchased/i).checked).toBe(true);
  });
});

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react'; // Assuming React Testing Library
import LinearGame from './LinearGame';
import * as linearGameLogic from './linearGameLogic';
import * as upgradeEngine from './upgradeEngine';

// Mock child components to isolate LinearGame logic
jest.mock('../shared/Incrementer', () => (props) => <div data-testid={`incrementer-${props.id}`} data-props={JSON.stringify(props)} />);

// Enhanced mock for UpgradeButton to inspect props
const mockUpgradeButtonComponent = jest.fn((props) => (
  <button
    data-testid={`upgrade-${props.upgradeDef.id}`}
    onClick={() => props.onPurchase(props.upgradeDef.id)}
    disabled={props.disabled || props.isPurchased} // Simplified disabled logic for mock
  >
    {props.upgradeDef.name}
    {props.affectedName && ` (Affects: ${props.affectedName})`}
    {props.isPurchased ? ' (Purchased)' : ''}
  </button>
));
jest.mock('../shared/UpgradeButton', () => mockUpgradeButtonComponent);
jest.mock('../shared/Tooltip', () => ({ children }) => <div>{children}</div>);


// Mock game logic and upgrade engine functions
const mockInitialGameState = {
  score: 100,
  totalPerSecond: 10, // For GLOBAL upgrade testing
  incrementers: [
    { id: 'thingamabob', name: 'Thingamabob', count: 1, currentCost: 10, baseValue: 1, individualProductionValue: 1, totalProductionFromType: 1, upgrades: { multiplier: 1, flatBonus: 0 } },
    { id: 'widget', name: 'Widget', count: 2, currentCost: 20, baseValue: 5, individualProductionValue: 5, totalProductionFromType: 10, upgrades: { multiplier: 1, flatBonus: 0 } },
  ],
  upgrades: {},
  purchasedUpgrades: [],
  settings: { showPurchased: false },
};

const mockUpgradeDefinitions = {
  'upg_thing': { id: 'upg_thing', name: 'Thing Upgrade', cost: 10, description: 'Boosts Thingamabobs', effects: [{ type: 'ADD', value: 5, targetId: 'thingamabob' }] },
  'upg_widget': { id: 'upg_widget', name: 'Widget Enhancer', cost: 20, description: 'Improves Widgets', effects: [{ type: 'MULTIPLIER', value: 2, targetId: 'widget' }] },
  'upg_global': { id: 'upg_global', name: 'Global Boost', cost: 50, description: 'Boosts All', effects: [{ type: 'GLOBAL_MULTIPLIER', value: 1.5, targetId: 'GLOBAL' }] },
  'upg_purchased': { id: 'upg_purchased', name: 'Purchased Upgrade', cost: 5, description: 'Already got it', effects: [{ type: 'ADD', value: 1, targetId: 'thingamabob' }] },
};

// This will be the list returned by getAvailableUpgrades
const mockDynamicAvailableUpgrades = [
  { ...mockUpgradeDefinitions.upg_thing, isAffordable: true },
  { ...mockUpgradeDefinitions.upg_widget, isAffordable: true },
  { ...mockUpgradeDefinitions.upg_global, isAffordable: true },
  { ...mockUpgradeDefinitions.upg_purchased, isAffordable: true }, // Will be filtered by LinearGame if purchased and showPurchased is false
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

// Mock for calculateProductionWithUpgrade
jest.spyOn(linearGameLogic, 'calculateProductionWithUpgrade').mockImplementation((gameState, upgradeId, incrementerId) => {
  if (upgradeId === 'upg_thing' && incrementerId === 'thingamabob') {
    return { incrementerProduction: 6, globalProduction: gameState.totalPerSecond }; // 1 (base) + 5 (upgrade)
  }
  if (upgradeId === 'upg_widget' && incrementerId === 'widget') {
    return { incrementerProduction: 20, globalProduction: gameState.totalPerSecond }; // 10 (base) * 2 (upgrade)
  }
  if (upgradeId === 'upg_global' && incrementerId === null) {
    return { incrementerProduction: 0, globalProduction: 15 }; // 10 (base) * 1.5
  }
  // Fallback for other cases, like purchased upgrade or if called unexpectedly
  const inc = gameState.incrementers.find(i => i.id === incrementerId);
  return {
    incrementerProduction: inc ? inc.totalProductionFromType : 0,
    globalProduction: gameState.totalPerSecond,
  };
});


// Control what getAvailableUpgrades returns for consistent testing
jest.spyOn(upgradeEngine, 'getAvailableUpgrades').mockImplementation((gs) => {
    return mockDynamicAvailableUpgrades.map(upg => ({
        ...upg,
        isAffordable: gs.score >= upg.cost,
    }));
});


describe('LinearGame Component', () => {
  beforeEach(() => {
    // Reset mocks and gameState before each test
    mockUpgradeButtonComponent.mockClear(); // Clear calls to the UpgradeButton mock
    linearGameLogic.initializeGame.mockClear().mockReturnValue(JSON.parse(JSON.stringify(mockInitialGameState)));
    linearGameLogic.applyUpgrade.mockClear().mockImplementation((gs, upgradeId) => {
      const def = mockUpgradeDefinitions[upgradeId];
      if (def && gs.score >= def.cost && !gs.purchasedUpgrades.includes(upgradeId)) {
        return { ...gs, purchasedUpgrades: [...gs.purchasedUpgrades, upgradeId], score: gs.score - def.cost };
      }
      return gs;
    });
    linearGameLogic.calculateProductionWithUpgrade.mockClear().mockImplementation((gameState, upgradeId, incrementerId) => {
      if (upgradeId === 'upg_thing' && incrementerId === 'thingamabob') {
        return { incrementerProduction: 6, globalProduction: gameState.totalPerSecond };
      }
      if (upgradeId === 'upg_widget' && incrementerId === 'widget') {
        return { incrementerProduction: 20, globalProduction: gameState.totalPerSecond };
      }
      if (upgradeId === 'upg_global' && incrementerId === null) { // targetId is 'GLOBAL', so incrementerId passed is null
        return { incrementerProduction: 0, globalProduction: 15 };
      }
      const inc = gameState.incrementers.find(i => i.id === incrementerId);
      return { // Default/fallback
        incrementerProduction: inc ? inc.totalProductionFromType : 0,
        globalProduction: gameState.totalPerSecond,
      };
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('passes correct props to UpgradeButton instances', () => {
    render(<LinearGame />);

    expect(mockUpgradeButtonComponent).toHaveBeenCalled();

    const calls = mockUpgradeButtonComponent.mock.calls;
    
    // Props for 'upg_thing'
    const thingProps = calls.find(call => call[0].upgradeDef.id === 'upg_thing')[0];
    expect(thingProps).toBeDefined();
    expect(thingProps.upgradeDef.name).toBe('Thing Upgrade');
    expect(thingProps.affectedName).toBe('Thingamabob'); // From incrementer name
    expect(thingProps.currentProduction).toBe(1); // Initial production of Thingamabob
    expect(thingProps.newProduction).toBe(6);   // Production after 'upg_thing'
    expect(thingProps.isPurchased).toBe(false);
    expect(thingProps.disabled).toBe(false); // score 100, cost 10

    // Props for 'upg_widget'
    const widgetProps = calls.find(call => call[0].upgradeDef.id === 'upg_widget')[0];
    expect(widgetProps).toBeDefined();
    expect(widgetProps.upgradeDef.name).toBe('Widget Enhancer');
    expect(widgetProps.affectedName).toBe('Widget'); // From incrementer name
    expect(widgetProps.currentProduction).toBe(10); // Initial production of Widget
    expect(widgetProps.newProduction).toBe(20);  // Production after 'upg_widget'
    expect(widgetProps.isPurchased).toBe(false);
    expect(widgetProps.disabled).toBe(false); // score 100, cost 20
    
    // Props for 'upg_global'
    const globalProps = calls.find(call => call[0].upgradeDef.id === 'upg_global')[0];
    expect(globalProps).toBeDefined();
    expect(globalProps.upgradeDef.name).toBe('Global Boost');
    expect(globalProps.affectedName).toBe('All Incrementers'); // Specific for GLOBAL targetId
    expect(globalProps.currentProduction).toBe(10); // Initial totalPerSecond
    expect(globalProps.newProduction).toBe(15);  // totalPerSecond after 'upg_global'
    expect(globalProps.isPurchased).toBe(false);
    expect(globalProps.disabled).toBe(false); // score 100, cost 50

    // 'upg_purchased' should also be rendered initially as it's not yet purchased
    const initialPurchasedProps = calls.find(call => call[0].upgradeDef.id === 'upg_purchased')[0];
    expect(initialPurchasedProps).toBeDefined();
    expect(initialPurchasedProps.isPurchased).toBe(false);
    expect(initialPurchasedProps.disabled).toBe(false); // score 100, cost 5
  });

  test('REQ-003: "Show Purchased" checkbox controls visibility of purchased upgrades', async () => {
    render(<LinearGame />);
    
    // Initially, all 4 upgrades are rendered because none are purchased.
    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_purchased')).toBeInTheDocument();
    
    // Simulate purchasing 'upg_purchased'
    act(() => {
        const purchaseTestUpgradeButton = screen.getByTestId('upgrade-upg_purchased');
        fireEvent.click(purchaseTestUpgradeButton); // This calls props.onPurchase('upg_purchased')
    });
    
    // After purchase, with showPurchased = false (default):
    // 'upg_purchased' should NOT be rendered by LinearGame's filter.
    // The other 3 should still be there.
    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-upg_purchased')).not.toBeInTheDocument();

    // Verify props of a remaining upgrade to ensure it's not affected
    const thingPropsAfterPurchase = mockUpgradeButtonComponent.mock.calls.find(call => call[0].upgradeDef.id === 'upg_thing')[0];
    expect(thingPropsAfterPurchase.isPurchased).toBe(false);


    // Find and click the "Show Purchased" checkbox
    const checkbox = screen.getByLabelText(/Show Purchased/i);
    act(() => {
      fireEvent.click(checkbox);
    });

    // Now, showPurchased is true. All upgrades, including 'upg_purchased', should be visible.
    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_purchased')).toBeInTheDocument();
    
    // Verify props for the now visible 'upg_purchased'
    const purchasedButtonProps = mockUpgradeButtonComponent.mock.calls.find(call => call[0].upgradeDef.id === 'upg_purchased')[0];
    expect(purchasedButtonProps.isPurchased).toBe(true);
    // Disabled state for purchased items is handled by LinearGame: `disabled={upgrade.isAffordable === false || gameState.purchasedUpgrades.includes(upgrade.id)}`
    expect(purchasedButtonProps.disabled).toBe(true);

    // Toggle back to hide purchased
    act(() => {
      fireEvent.click(checkbox);
    });
    expect(screen.getByTestId('upgrade-upg_thing')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_widget')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-upg_global')).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-upg_purchased')).not.toBeInTheDocument();
  });

  test('Initial state of "Show Purchased" checkbox reflects gameState', () => {
    render(<LinearGame />);
    const checkbox = screen.getByLabelText(/Show Purchased/i);
    expect(checkbox.checked).toBe(false);

    // Test with initial state true
    const trueInitialState = { ...mockInitialGameState, settings: { ...mockInitialGameState.settings, showPurchased: true }};
    linearGameLogic.initializeGame.mockReturnValueOnce(JSON.parse(JSON.stringify(trueInitialState)));
    mockUpgradeButtonComponent.mockClear(); // Clear calls from previous render
    render(<LinearGame />);
    const checkboxTrue = screen.getByLabelText(/Show Purchased/i);
    expect(checkboxTrue.checked).toBe(true);
  });
});
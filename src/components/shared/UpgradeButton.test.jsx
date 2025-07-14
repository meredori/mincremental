import React from 'react';
import { render, screen } from '@testing-library/react';
import UpgradeButton from './UpgradeButton';

describe('UpgradeButton', () => {
  const mockUpgrade = {
    id: 'upgrade1',
    name: 'Test Upgrade',
    desc: 'This is a test upgrade.',
    cost: 100,
    effects: [{ type: 'ADD', value: 5, targetId: 'incrementer1' }], // Ensure targetId is present
    purchased: false,
  };

  const mockOnPurchase = jest.fn();
  const affectedName = 'TestIncrementer';

  test('renders correctly with valid effects array, displays benefit including affectedName', () => {
    render(
      <UpgradeButton
        upgrade={mockUpgrade}
        currentProduction={10}
        newProduction={15}
        affectedName={affectedName}
        onPurchase={mockOnPurchase}
        disabled={false}
      />
    );

    // Check that the upgrade name is displayed
    expect(screen.getByText('Test Upgrade')).toBeInTheDocument();

    // Check that the direct benefit label is displayed correctly
    // Based on currentProduction=10, newProduction=15, increase is 5
    // The label should be "+5.0/sec (+50.0%) to TestIncrementer"
    expect(screen.getByText(`+5.0/sec (+50.0%) to ${affectedName}`)).toBeInTheDocument();

    // Check that "Invalid Upgrade" is NOT displayed
    expect(screen.queryByText('Invalid Upgrade Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid Upgrade')).not.toBeInTheDocument(); // Keeping original check just in case
  });

  test('renders "Invalid Upgrade Data" when upgrade prop is malformed', () => {
    render(
      <UpgradeButton
        upgrade={null}
        currentProduction={10}
        newProduction={15}
        affectedName={affectedName}
        onPurchase={mockOnPurchase}
        disabled={false}
      />
    );
    expect(screen.getByText('Invalid Upgrade Data')).toBeInTheDocument();

    render(
      <UpgradeButton
        upgrade={{ ...mockUpgrade, effects: [] }}
        currentProduction={10}
        newProduction={15}
        affectedName={affectedName}
        onPurchase={mockOnPurchase}
        disabled={false}
      />
    );
    expect(screen.getByText('Invalid Upgrade Data')).toBeInTheDocument();

    render(
      <UpgradeButton
        upgrade={{ ...mockUpgrade, effects: null }}
        currentProduction={10}
        newProduction={15}
        affectedName={affectedName}
        onPurchase={mockOnPurchase}
        disabled={false}
      />
    );
    expect(screen.getByText('Invalid Upgrade Data')).toBeInTheDocument();
  });

  test('renders correctly when affectedName is not provided', () => {
    render(
      <UpgradeButton
        upgrade={mockUpgrade}
        currentProduction={10}
        newProduction={15}
        // affectedName is deliberately omitted
        onPurchase={mockOnPurchase}
        disabled={false}
      />
    );
    expect(screen.getByText('Test Upgrade')).toBeInTheDocument();
    // Expect "to undefined" as per current component logic if affectedName is directly interpolated
    expect(screen.getByText(`+5.0/sec (+50.0%) to undefined`)).toBeInTheDocument();
    expect(screen.queryByText('Invalid Upgrade Data')).not.toBeInTheDocument();
  });
});
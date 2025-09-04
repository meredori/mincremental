import React from 'react';
import { render, screen } from '@testing-library/react'; // Assuming React Testing Library
import Incrementer from './Incrementer';
import Tooltip from './Tooltip'; // Mock or use actual if simple

// Mock Tooltip to verify its usage without testing its internals here
jest.mock('./Tooltip', () => ({ content, children }) => (
  <div data-testid="tooltip" data-tooltip-content={JSON.stringify(content)}>
    {children}
  </div>
));

describe('Incrementer Component', () => {
  const mockProps = {
    id: 'test-inc',
    name: 'Test Incrementer',
    description: 'A test incrementer.',
    count: 2,
    currentCost: 50,
    individualProductionValue: 5, // REQ-002
    totalProductionFromType: 10,  // REQ-002
    onPurchase: jest.fn(),
    score: 100,
    tooltipContent: { // REQ-ISSUE-8
      base: 2,
      flatBonus: 1,
      multiplier: 1.5,
      finalIndividual: 5 // (2+1)*1.5 = 4.5, but game logic floors to 5 in this example
    }
  };

  const propsNoCount = {
    ...mockProps,
    count: 0,
    totalProductionFromType: 0,
  };
  
  const propsNoTooltip = {
    ...mockProps,
    tooltipContent: undefined,
  };

  test('REQ-002: displays individualProductionValue and totalProductionFromType distinctly', () => {
    render(<Incrementer {...mockProps} />);

    // Check for individual production value
    // Regex allows for variations in text like "/sec"
    expect(screen.getByText(/Value \(per unit\):/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${mockProps.individualProductionValue}/sec`, 'i'))).toBeInTheDocument();

    // Check for total production from type (only if count > 0)
    expect(screen.getByText(new RegExp(`Total from ${mockProps.name}s:`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${mockProps.totalProductionFromType}/sec`, 'i'))).toBeInTheDocument();
  });

  test('REQ-002: does not display totalProductionFromType if count is 0', () => {
    render(<Incrementer {...propsNoCount} />);
    
    expect(screen.getByText(/Value \(per unit\):/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${propsNoCount.individualProductionValue}/sec`, 'i'))).toBeInTheDocument();

    expect(screen.queryByText(new RegExp(`Total from ${propsNoCount.name}s:`, 'i'))).not.toBeInTheDocument();
  });

  test('REQ-ISSUE-8: renders Tooltip with correct content when tooltipContent is provided', () => {
    render(<Incrementer {...mockProps} />);
    
    const tooltipElement = screen.getByTestId('tooltip');
    expect(tooltipElement).toBeInTheDocument();
    expect(tooltipElement).toHaveAttribute('data-tooltip-content', JSON.stringify(mockProps.tooltipContent));
  });

  test('REQ-ISSUE-8: does not render Tooltip when tooltipContent is not provided', () => {
    render(<Incrementer {...propsNoTooltip} />);
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
    // Check that the incrementer content itself is still there
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
  });

  test('REQ-ISSUE-3: applies "effect-display" class to production value elements', () => {
    render(<Incrementer {...mockProps} />);

    const individualProdValueElement = screen.getByText(new RegExp(`${mockProps.individualProductionValue}/sec`));
    const totalProdValueElement = screen.getByText(new RegExp(`${mockProps.totalProductionFromType}/sec`));

    expect(individualProdValueElement).toHaveClass('effect-display');
    expect(totalProdValueElement).toHaveClass('effect-display');
    expect(totalProdValueElement).toHaveClass('highlight'); // Also check for highlight class
  });
  
  test('Purchase button is enabled when score is sufficient', () => {
    render(<Incrementer {...mockProps} score={mockProps.currentCost + 10} />);
    const purchaseButton = screen.getByRole('button', { name: /Purchase for/i });
    expect(purchaseButton).not.toBeDisabled();
  });

  test('Purchase button is disabled when score is insufficient', () => {
    render(<Incrementer {...mockProps} score={mockProps.currentCost - 10} />);
    const purchaseButton = screen.getByRole('button', { name: /Purchase for/i });
    expect(purchaseButton).toBeDisabled();
  });

  test('Calls onPurchase when purchase button is clicked and enabled', () => {
    const handlePurchaseMock = jest.fn();
    render(<Incrementer {...mockProps} onPurchase={handlePurchaseMock} score={mockProps.currentCost + 10} />);
    const purchaseButton = screen.getByRole('button', { name: /Purchase for/i });
    
    purchaseButton.click();
    expect(handlePurchaseMock).toHaveBeenCalledWith(mockProps.id);
  });
});
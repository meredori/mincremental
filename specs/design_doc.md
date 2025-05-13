# Design Document: Mincremental

## Overview
Mincremental is a playful, animated incremental game UI designed to delight users with vibrant colors, bouncy effects, and floating cartoon bubbles. This design is intended as a visually engaging foundation for the entire app, supporting multiple game entries and a fun, accessible user experience. This document outlines the design, component structure, user experience, accessibility, and technical implementation details for the app.

---

## 1. Visual & Interaction Design

- **Theme:** Cartoon-inspired, bright and pastel palette, playful fonts (Comic Sans MS or similar), and animated UI elements.
- **Layout:**
  - Centered title: "Choose Your Adventure!" with animated bounce.
  - Responsive grid (auto-fit, up to 3x3) of game cards.
  - Each card features a large emoji/icon, game name, description, and a "Let's Play!" button.
  - Floating, semi-transparent cartoon bubbles animate upward in the background for visual interest.
- **Animations:**
  - Title bounces.
  - Game icons wiggle.
  - Cards scale and rotate slightly on hover.
  - "Let's Play!" button scales on hover and depresses on click.
  - Bubbles float and fade out.

---

## 2. Component Structure

- **Main Selector Component**
  - Renders the main selector UI for the app.
  - Accepts a `games` prop (array of game objects) and `onSelect` callback.
  - Handles up to 9 games, displayed in a responsive grid.
  - Manages bubble animation via `useEffect` and DOM manipulation.
  - Uses a `BounceEffect` subcomponent for interactive icon animation.
- **Stylesheet**
  - Defines the cartoon color palette and all animation keyframes.
  - Ensures responsive design for mobile and desktop.
  - Provides high-contrast text and large touch targets.

---

## 3. User Experience (UX)

- **Fun, Playful, and Accessible:**
  - Large, clear icons and text.
  - Buttons and cards are keyboard-accessible and have visible focus states.
  - Animations are smooth but not distracting.
  - Responsive layout adapts to all screen sizes.
- **Game Selection:**
  - Clicking a card or "Let's Play!" button triggers the `onSelect` callback with the selected game ID.
  - Visual feedback on selection (card highlights, button animates).
- **Background Animation:**
  - Floating bubbles are purely decorative and do not interfere with interaction.

---

## 4. Accessibility

- All interactive elements (cards, buttons) are focusable and operable via keyboard.
- Sufficient color contrast between text and backgrounds.
- Animations do not flash or strobe.
- Game icons have accessible labels (via `aria-label` or visible text).

---

## 5. Technical Implementation

- **Location:**
  - All relevant files under `src/components/` and associated style directories.
- **Files:**
  - Main selector React component (e.g., `GameSelector.jsx` or similar).
  - Stylesheet for the app's playful theme.
- **Props:**
  - `games`: Array of `{ id, name, description, color, icon }` objects.
  - `onSelect`: Function called with selected game ID.
- **State:**
  - `activeGame`: Tracks the currently selected game (for visual feedback).
- **Bubble Animation:**
  - Uses `setInterval` in `useEffect` to periodically create and animate bubbles.
  - Bubbles are appended to `document.body` and removed after animation.
- **Responsiveness:**
  - CSS grid adapts to available width; single column on mobile.

---

## 6. Example Usage

```jsx
<GameSelector games={gamesArray} onSelect={handleSelectGame} />
```

---

## 7. Future Enhancements
- Add support for custom icons/images.
- Allow user to disable background animation for reduced motion.
- Integrate with global theming system.

---

## 8. References
- [App Style Sheet](../src/App.css)
- [GameSelector.jsx](../src/components/gameselector/GameSelector.jsx)

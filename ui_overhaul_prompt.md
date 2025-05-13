# UI Overhaul & Landing Page Prompt Specification

## 1. Overall Style & Inspiration

*   **Theme:** Playful, vibrant, and clean.
*   **Inspiration:**
    *   Fall Guys: Energy, primary button style.
    *   Fruit Ninja 2: Saturated accent colors ("juicy" feel).
    *   Pokémon Go: Teal/White base color scheme, clean input fields, flat/filled icons.

## 2. Color Palette

*   **Primary:** Teal (similar to Pokémon Go UI, e.g., `#4FC1A6`)
*   **Secondary/Background:** White / Off-white (e.g., `#FFFFFF`, `#F8F8F8`)
*   **Accents:** Saturated, vibrant colors (e.g., juicy red `#FF6B6B`, orange `#FFA500`, green `#4ECDC4`) for primary buttons, highlights, icons.

## 3. Typography

*   **Titles/Headings:** [Fredoka One](https://fonts.google.com/specimen/Fredoka+One) - Bold, chunky, playful.
*   **Body Text/UI Labels:** [Poppins](https://fonts.google.com/specimen/Poppins) - Clean, friendly, readable.
*   **Links:** Ensure Google Fonts links are included in the HTML/CSS setup.

## 4. Global Header & Footer

*   **Header:**
    *   Persistent across all screens.
    *   **Top Left:** User profile area showing avatar/icon, username, and current level.
    *   **Top Right:** "Back to Game Selection" button, styled as a prominent accent button.
    *   Responsive layout—elements spaced to corners, header height consistent with playful theme.
*   **Footer:**
    *   Simple, clean, and unobtrusive.
    *   Can be used for copyright, links, or version info.

## 5. Landing Page / Game Selector

*   **Layout:** Horizontal scrolling container for game selection cards.
*   **Cards:**
    *   **Style:** Rounded corners, subtle drop shadow for depth.
    *   **Content:** Use simple flat/filled icons or solid accent color blocks (not full background images) representing the game mode. Include the game mode title using Fredoka One.
    *   **Interaction:** Scale up slightly on hover/selection.
*   **Other Elements:**
    *   Main Page Title (e.g., "Select Game") using Fredoka One.
    *   User Profile area (icon/name display).
    *   Settings button/icon access.

## 5. General UI Components

*   **Primary Buttons:** Fall Guys style - bold, use vibrant accent colors, potentially thick outlines or distinct rounded/pill shapes. White Poppins text.
*   **Secondary Buttons:** Teal background, white Poppins text, standard rounded corners.
*   **Input Fields:** Pokémon Go style - clean, rounded corners, white background, subtle border. Teal border/highlight on focus state.
*   **Icons:** Pokémon Go style - flat, filled, using teal or accent colors. Consistent icon set.
*   **Modals/Popups:** Clean design using the primary teal/white palette, rounded corners, clear hierarchy with Fredoka One titles and Poppins text.

## 6. Transitions & Animations

*   Implement bouncy, playful transitions between screens/views.
*   Apply subtle bouncy effects to interactive elements (like button clicks or card selections) where appropriate to enhance the playful feel.
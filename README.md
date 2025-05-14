# Mincremental

Mincremental is a modular incremental game platform built with React. It features a game selector, multiple incremental games (Exponential and Linear), and a clean, extensible architecture with global header/footer components. The project is designed for easy expansion and maintainability.

## Features

- Modular React architecture
- Game selector with support for multiple games
- Exponential and Linear incremental games included
- Global header and footer with version display
- Responsive UI with Bootstrap
- Centralized version management
- Extensible component structure

## Tech Stack

- **React 18**
- **Vite** (development/build)
- **Bootstrap 5**
- **Lodash**
- **Jest** & **React Testing Library** (testing)
- **Sass** (optional, for styling)
- **Webpack** (optional, config included)

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Run the development server:**
   ```sh
   npm run dev
   ```

3. **Build for production:**
   ```sh
   npm run build
   ```

4. **Run tests:**
   ```sh
   npm test
   ```

## File Structure

```
.
├── src/
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point, renders App
│   ├── version.js             # Centralized version info
│   ├── index.html             # HTML entry point
│   ├── components/
│   │   ├── exponential/
│   │   │   ├── ExponentialGame.jsx
│   │   │   └── exponential.css
│   │   ├── linear/
│   │   │   ├── LinearGame.jsx
│   │   │   └── linear.css
│   │   ├── shared/
│   │   │   ├── Incrementer.jsx
│   │   │   ├── incrementer.css
│   │   │   ├── Scoreboard.jsx
│   │   │   └── scoreboard.css
│   │   ├── global/
│   │   │   ├── GlobalHeader.jsx
│   │   │   └── GlobalFooter.jsx
│   │   └── gameselector/
│   │       └── GameSelector.jsx
│   └── assets/
│       └── sprites/           # Game art assets
├── specs/                     # Design, architecture, and acceptance criteria
│   └── design_doc.md
├── package.json               # Project metadata and dependencies
├── vite.config.js             # Vite configuration
├── webpack.config.js          # Webpack configuration (optional)
├── jest.config.js             # Jest configuration
└── README.md                  # Project documentation
```

## Documentation & Specs

- [specs/design_doc.md](specs/design_doc.md)

These documents provide detailed requirements, pseudocode, and architectural decisions for the header and footer components.

## Versioning

- App version is managed in [`src/version.js`](src/version.js:1).
- Package version is in [`package.json`](package.json:1).

## License

See [LICENSE.txt](LICENSE.txt) for license information.

---
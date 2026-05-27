# -4 Zenith Portfolio

Premium portfolio site built with React + TypeScript + Vite + Tailwind CSS.

## Project Structure

```
/
├── .bolt/
│   ├── config.json          # Bolt.new template config (bolt-vite-react-ts)
│   └── prompt               # Bolt project prompt
├── public/
│   ├── logo.jpg             # Logo image
│   ├── logo.mp4             # Animated logo video
│   └── vite.svg
├── src/
│   ├── App.tsx              # Main app — ALL components in one file (~2000 lines)
│   ├── index.css            # Full design system, animations, glassmorphism utilities
│   ├── main.tsx             # React entry point
│   └── vite-env.d.ts        # Vite type declarations
├── index.html               # HTML entry — loads JetBrains Mono from Google Fonts
├── package.json             # Dependencies: react, lucide-react, tailwindcss
├── tailwind.config.js       # Tailwind config
├── vite.config.ts           # Vite config
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── postcss.config.js
└── eslint.config.js

## IMPORTANT — Upload Order
Upload these zips IN ORDER (1 → 2 → 3):
- Part 1: Config files + README (this file)
- Part 2: src/ source files (App.tsx, index.css, main.tsx)
- Part 3: Remaining config files + public assets

## Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Lucide React (icons)
- JetBrains Mono (Google Fonts — loaded in index.html)

## Key Features
- GPU-accelerated iris/curtain scroll transition (canvas-based)
- Custom neon cursor (desktop only, hidden on touch devices)
- Lightning mouse trail effect (canvas)
- Floating terminal HUD with AI typing animation
- Matrix digital rain mode
- Full glassmorphism design system
- Mobile-responsive navbar
```

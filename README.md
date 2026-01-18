# Todo Face

A browser extension that replaces your new tab page with a beautiful, minimal interface. Built with a brutalist/monospace aesthetic featuring a warm sepia-toned design.

## ✨ Features

- **Custom New Tab Page** – Replace the default browser new tab with a personalized experience
- **Popup Interface** – Quick access through the extension popup
- **Brutalist Design** – Sharp corners, monospace typography (JetBrains Mono), and warm sepia tones
- **Dark Mode Support** – Full light/dark theme support out of the box

## 🛠️ Tech Stack

- **[WXT](https://wxt.dev/)** – Next-gen browser extension framework
- **[React 19](https://react.dev/)** – UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** – Utility-first CSS framework
- **[Shadcn UI](https://ui.shadcn.com/)** – Re-usable component library
- **[Lucide Icons](https://lucide.dev/)** – Beautiful icon library
- **TypeScript** – Type safety

## 📁 Project Structure

```
todo-face/
├── assets/              # Global styles (Tailwind CSS)
├── components/          # Shared UI components (Shadcn)
│   └── ui/
├── entrypoints/         # Extension entry points
│   ├── background.ts    # Service worker
│   ├── content.ts       # Content script
│   ├── newtab/          # New tab page
│   └── popup/           # Extension popup
├── lib/                 # Utility functions
├── public/              # Static assets (icons, etc.)
└── wxt.config.ts        # WXT configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todo-face
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. Load the extension in your browser:
   - **Chrome**: Navigate to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked". Select the `.output/chrome-mv3` folder.
   - **Firefox**: Navigate to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `.output/firefox-mv2` folder.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server for Chrome |
| `bun run dev:firefox` | Start development server for Firefox |
| `bun run build` | Build for Chrome production |
| `bun run build:firefox` | Build for Firefox production |
| `bun run zip` | Create Chrome extension zip file |
| `bun run zip:firefox` | Create Firefox extension zip file |
| `bun run compile` | Type-check the codebase |

## 🎨 Design System

This project uses a custom brutalist theme with:

- **Font**: JetBrains Mono (monospace)
- **Border Radius**: 0 (sharp corners)
- **Color Palette**: Warm sepia-toned colors using OKLCH color space
- **Shadows**: Soft, directional shadows

The theme is defined in `assets/tailwind.css` and supports both light and dark modes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private. All rights reserved.

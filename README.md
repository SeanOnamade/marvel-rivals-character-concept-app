# Marvel Rivals Ability Builder

A fully interactive web-based character creation tool that reproduces the in-game **Marvel Rivals ability screen layout**, allowing users to create custom heroes with live preview and PNG export.

![Marvel Rivals Ability Builder](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

- **Live Preview**: See your changes instantly in a pixel-accurate Marvel Rivals ability page
- **Full Customization**: Edit hero name, role, difficulty, attacks, abilities, passive, and ultimate
- **Image Upload**: Upload and position custom hero portraits with drag-and-drop support
- **PNG Export**: Export your custom ability page as a high-quality PNG image
- **Authentic Design**: Matches the in-game Marvel Rivals UI with:
  - Dark brushed-metal backgrounds
  - Yellow accent lines and borders
  - Diamond-shaped ability icons
  - Glowing effects on ultimate abilities
  - Role-based color coding

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173/`

## 🎮 Usage

1. **Edit Hero Information**: Use the form editor on the left to customize your hero
   - Enter hero name, select role (Strategist/Duelist/Vanguard)
   - Set difficulty (1-5 stars)
   - Fill in attack, abilities, passive, and ultimate details

2. **Upload Hero Portrait**: Click on the circular portrait area to upload an image
   - Supports drag-and-drop
   - Automatically applies circular mask
   - Role badge appears in bottom-right corner

3. **Preview**: The right panel shows a live preview matching the Marvel Rivals layout
   - Left panel: Hero portrait, name, difficulty
   - Center column: Attacks and team-up abilities
   - Right column: Abilities (Shift, E, F, R) and Ultimate (Q+E)

4. **Export**: Click "Export as PNG" to download your custom ability page

## 🛠 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **html-to-image** - PNG export functionality
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── AbilityCard.tsx          # Reusable ability card component
│   ├── AbilityPageRenderer.tsx  # Main preview renderer
│   ├── DifficultyStars.tsx      # Star rating display
│   ├── ExportButton.tsx         # PNG export button
│   ├── FormEditor.tsx           # Left-side form editor
│   └── HeroPortrait.tsx         # Hero portrait with upload
├── types.ts                     # TypeScript interfaces
├── utils.ts                     # Utility functions
├── App.tsx                      # Main app component
├── main.tsx                     # Entry point
└── index.css                    # Global styles
```

## 🎨 Customization

### Colors

The Marvel Rivals color scheme is defined in `tailwind.config.js`:

- `marvel-dark`: #1a1a1a (main background)
- `marvel-metal`: #2a2a2a (card backgrounds)
- `marvel-yellow`: #f4c430 (primary accent)
- `marvel-accent`: #ffd700 (secondary accent)

### Role Colors

Role badge colors are defined in `src/utils.ts`:

- Strategist: Green (#4CAF50)
- Duelist: Red (#F44336)
- Vanguard: Blue (#2196F3)

## 📸 Screenshots

The application creates ability pages that match the in-game Marvel Rivals layout, including:

- Authentic typography and spacing
- Diamond-shaped ability icons
- Yellow accent lines
- Glowing borders on ultimate abilities
- Role-based color coding

## 🤝 Contributing

This is a template project. Feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Credits

- Inspired by Marvel Rivals by NetEase Games
- Built with modern web technologies
- Created with Antigravity AI

---

**Note**: This is a fan-made tool and is not affiliated with or endorsed by Marvel or NetEase Games.

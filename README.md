<div align="center">

# Marvel Rivals Ability Builder

**Create stunning custom hero ability pages that look straight out of the game**

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Examples

<div align="center">

| Doctor Strange | The Spot (Custom Hero) |
|:--------------:|:----------------------:|
| ![Doctor Strange Example](public/downloads/doctor-strange-ability-page%20(33).png) | ![The Spot Example](public/downloads/the-spot-ability-page%20(5).png) |

*These ability pages were created entirely within the app and exported as PNG*

</div>

---

## Features

### Pixel-Perfect Design
Recreates the authentic Marvel Rivals in-game ability screen with diamond-shaped icons, glowing ultimates, yellow accent lines, and the signature dark brushed-metal aesthetic.

### Live Preview
See your changes instantly as you edit. What you see is exactly what you'll export.

### PC & Console Support
Switch between keyboard/mouse hotkeys (SHIFT, E, F, Q) and controller buttons (L1, R1, Triangle, L3+R3) with one click.

### Full Image Control
Upload hero portraits with precise positioning, scaling, cropping, and edge fade controls. Add hero logos that appear behind your character.

### AI Background Removal
Remove backgrounds from uploaded hero portraits and logos with one click using built-in AI-powered background removal. No external tools needed.

### Save & Load Templates
- Save your work locally with thumbnail previews
- Export templates as JSON files to share with others
- Import templates from files
- Undo/redo support for all changes

### Mobile Responsive
Full mobile support with a tabbed interface, touch-friendly controls, and native sharing via the Web Share API.

### Complete Customization
- Hero name, role, and difficulty rating
- Unlimited attacks, abilities, and passives
- Team-up abilities with partner hero icons
- Ultimate ability with glow effects
- Custom ability icons with scaling
- Colored text highlights (green/blue/orange)
- Additional pages (like Gambit's card forms)
- Banner color and fold styling

### High-Quality Export
Export your creation as a crisp 1280×720 PNG image. On mobile, share directly to any app. On desktop, download as PNG.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/marvel-rivals-template.git
cd marvel-rivals-template

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## How to Use

1. **Choose a Starting Point**
   - Start with a blank template, or
   - Load a preset (Doctor Strange, The Spot)
   - Import a template file shared by someone else

2. **Customize Your Hero**
   - Set the hero name, role (Strategist/Duelist/Vanguard), and difficulty
   - Upload a hero portrait and adjust positioning
   - Use "Remove Background" to clean up uploaded images
   - Choose your banner color and background

3. **Add Abilities**
   - Fill in attacks, abilities, passives, and ultimate
   - Upload custom icons or leave them as placeholders
   - Use color tags like `[green]text[/green]` for highlights

4. **Configure Team-Ups**
   - Add team-up abilities with partner hero icons
   - Set whether your hero is the anchor or secondary

5. **Save & Export**
   - Save your template locally for later editing
   - Export as PNG to share your creation
   - Export as JSON to share the editable template

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Lightning-fast dev server & build |
| **Tailwind CSS 4** | Utility-first styling |
| **modern-screenshot** | High-quality PNG export |
| **@imgly/background-removal** | AI-powered background removal |
| **Lucide React** | Beautiful icons |

---

## Project Structure

```
marvel-rivals-template/
├── public/
│   ├── backgrounds/      # Gallery background images
│   ├── downloads/        # Sample templates (JSON + PNG)
│   ├── hero-icons/       # All hero avatar icons
│   ├── icons/            # Ability icons by hero
│   ├── logos/            # Hero logo images
│   ├── role-icons/       # Strategist/Duelist/Vanguard badges
│   └── ui/               # UI elements (buttons, banners, etc.)
├── src/
│   ├── components/
│   │   ├── AbilityPageRenderer.tsx  # Main preview canvas
│   │   ├── FormEditor.tsx           # Editor panel with all controls
│   │   ├── HeroPortrait.tsx         # Hero image with controls
│   │   ├── ImageCropEditor.tsx      # Crop modal
│   │   ├── CollapsibleSection.tsx   # Mobile-friendly collapsible UI
│   │   ├── DifficultyStars.tsx      # Star rating display
│   │   └── ExportButton.tsx         # Export/share button
│   ├── types.ts          # TypeScript interfaces & presets
│   ├── utils.ts          # Helper functions (export, templates)
│   ├── App.tsx           # Main application
│   └── index.css         # Global styles & responsive design
├── docs/
│   └── USER_TEMPLATES_PLAN.md  # Template system documentation
└── package.json
```

---

## Customization

### Adding New Hero Presets

Edit `src/types.ts` and add to the `HERO_PRESETS` array:

```typescript
export const HERO_PRESETS: HeroPresetConfig[] = [
  // ... existing presets
  {
    name: 'Your Hero',
    getData: () => ({
      name: 'HERO NAME',
      role: 'Duelist',
      difficulty: 3,
      // ... full hero data
    }),
  },
];
```

### Color Scheme

The Marvel Rivals palette is defined in `tailwind.config.js`:

- `marvel-dark`: #1a1a1a (main background)
- `marvel-metal`: #2a2a2a (card/panel backgrounds)
- `marvel-yellow`: #f4c430 (primary accent)
- `marvel-accent`: #ffd700 (secondary accent)

---

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Add new hero presets
- Submit pull requests

---

## License

MIT License - use this project however you like!

---

## Disclaimer

This is a **fan-made tool** and is not affiliated with, endorsed by, or connected to Marvel, NetEase Games, or any official Marvel Rivals properties. All Marvel characters and related elements are trademarks of Marvel Entertainment, LLC.

---

<div align="center">

**Made with ❤️ for the Marvel Rivals community**

*If you find this useful, consider giving it a ⭐!*

</div>

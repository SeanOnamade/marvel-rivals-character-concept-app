# User Template Save/Load Feature Plan

## Overview

Allow users to save their custom hero configurations as templates and load them later, similar to how the Doctor Strange preset works but for user-created content.

## Requirements

### Save Template Functionality
- User can save their current `heroData` + `displaySettings` as a named template
- Template should capture:
  - All hero data (name, role, abilities, attacks, team-ups, ultimate, etc.)
  - Portrait image (as base64 data URL)
  - Display settings (control scheme, background, etc.)
  - Custom icons and images

### Load Template Functionality
- User can select from a list of saved templates
- Loading a template replaces current work (with confirmation)
- Templates should be distinguishable from built-in presets

### Storage Options

#### Option A: LocalStorage (Recommended for MVP)
**Pros:**
- No backend required
- Works offline
- Simple implementation
- Persists across browser sessions

**Cons:**
- ~5-10MB limit per domain
- Data lost if browser data is cleared
- Not shareable between devices

**Implementation:**
```typescript
interface SavedTemplate {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  heroData: HeroData;
  displaySettings: DisplaySettings;
}

// Save
localStorage.setItem('userTemplates', JSON.stringify(templates));

// Load
const templates = JSON.parse(localStorage.getItem('userTemplates') || '[]');
```

#### Option B: File Export/Import
**Pros:**
- No storage limits
- User controls their files
- Shareable between users/devices
- Backup-friendly

**Cons:**
- Extra steps for user (file picker dialogs)
- Users must manage files themselves

**Implementation:**
```typescript
// Export
const blob = new Blob([JSON.stringify(template)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Trigger download via <a> element

// Import
// File input onChange -> FileReader -> JSON.parse
```

#### Option C: Combined Approach (Recommended Long-term)
- Use localStorage for quick saves
- Provide export/import for backups and sharing
- Best of both worlds

## UI Design

### Save Template
Location: FormEditor.tsx, near the "Quick Start" section

```
[Quick Start Section]
├── New Blank Template
├── Load Doctor Strange
└── ─────────────────────
    [Save Current as Template] button
    └── Opens modal with:
        - Template name input
        - Optional description
        - Save / Cancel buttons
```

### Load User Templates
Location: FormEditor.tsx, new section below Quick Start

```
[Your Saved Templates Section]
├── Template 1 [Load] [Delete]
├── Template 2 [Load] [Delete]
└── [Import from File] button

[Export Current] button (in header or as action)
```

### Template Management Modal
- List all saved templates
- Preview thumbnail (optional, future enhancement)
- Rename/delete functionality
- Export individual templates
- Bulk export/import

## Data Structure

```typescript
interface UserTemplate {
  id: string;                    // UUID
  name: string;                  // User-provided name
  description?: string;          // Optional description
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
  version: number;               // Schema version for migrations
  heroData: HeroData;            // Full hero configuration
  displaySettings: Partial<DisplaySettings>;  // Display preferences
  thumbnail?: string;            // Base64 preview image (optional)
}

interface TemplateStorage {
  version: number;               // Storage schema version
  templates: UserTemplate[];
}
```

## Implementation Steps

### Phase 1: Core Functionality ✅ DONE
1. ~~Create `useTemplateStorage` hook for localStorage operations~~
2. ~~Add "Save Template" button and modal in FormEditor~~
3. ~~Add "Your Templates" section with load/delete~~
4. ~~Handle localStorage quota exceeded errors gracefully~~

*Implemented via file-based approach instead of localStorage*

### Phase 2: File Import/Export ✅ DONE
1. ✅ Add "Export Template" functionality (JSON file download)
2. ✅ Add "Import Template" functionality (file upload)
3. ✅ Validate imported JSON against expected schema
4. ✅ Handle version migrations for older template formats

### Phase 3: Enhancements ✅ DONE
1. Template thumbnails/previews ✅ DONE

---

## Roadmap Complete 🎉

All planned features have been implemented. The template system is feature-complete.

## Technical Considerations

### Image Handling
- Portrait images stored as base64 data URLs can be large
- Consider compressing images before saving
- Warn users if template size exceeds recommended limits
- For file export: optionally strip images to reduce file size

### Schema Versioning
- Include version number in saved templates
- Implement migration functions for breaking changes
- Gracefully handle unknown/missing fields

### Error Handling
- localStorage quota exceeded
- Invalid JSON on import
- Missing required fields
- Corrupted data recovery

## File Structure

```
src/
├── hooks/
│   └── useTemplateStorage.ts    # LocalStorage operations
├── components/
│   ├── SaveTemplateModal.tsx    # Save dialog
│   ├── UserTemplateList.tsx     # Saved templates section
│   └── TemplateImportExport.tsx # File operations
└── types.ts                     # Add UserTemplate interface
```

## Dependencies

No new dependencies required for MVP (localStorage + native File API).

Optional for enhanced UX:
- `file-saver` - Cross-browser file downloads
- `uuid` - Better ID generation (currently using Math.random)
- `lz-string` - Compression for large templates

## Timeline Estimate

- Phase 1 (Core): 2-4 hours
- Phase 2 (Files): 1-2 hours  
- Phase 3 (Enhancements): Variable

## Resolved Questions

1. Templates reference background images (from gallery), don't embed them
2. localStorage handles template limit naturally (~5-10MB)
3. Cloud sync/sharing not implemented - file export/import is sufficient

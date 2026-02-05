// Types for Marvel Rivals Hero Builder
export type Role = 'Strategist' | 'Duelist' | 'Vanguard';
export type ControlScheme = 'PC' | 'Console';

// Template file format for saving/loading hero configurations
export interface HeroTemplate {
    version: number;           // Schema version for future migrations
    name: string;              // Hero name from the template
    exportedAt: string;        // ISO date string
    heroData: HeroData;        // Full hero configuration
    displaySettings: Partial<DisplaySettings>;  // Display preferences
    thumbnail?: string;        // Optional base64 preview image
}

export interface Ability {
    id: string;
    name: string;
    description: string;
    hotkey: string;
    hotkeyConsole?: string; // Console button equivalent
    icon?: string;
    iconScale?: number; // Icon scale (0.5 to 2, default 1)
    isPassive?: boolean; // Passives appear at bottom of abilities column
}

export interface Attack {
    id: string;
    name: string;
    description: string;
    hotkey: string;
    hotkeyConsole?: string;
    icon?: string;
    iconScale?: number; // Icon scale (0.5 to 2, default 1)
}

export interface TeamUpAbility {
    id: string;
    name: string;
    description: string;
    hotkey: string; // Team-ups have hotkeys like Z, C, etc.
    hotkeyConsole?: string;
    icon?: string;
    iconScale?: number; // Icon scale (0.5 to 2, default 1)
    isPassive?: boolean; // Team-ups can be passive too
    isAnchor?: boolean; // true = hero is anchor, false = hero is secondary (default: true)
    anchorIcon?: string; // Icon for the anchor hero (if current hero is not anchor)
    partnerIcons?: string[]; // Icons for team-up partners (other heroes in the team-up)
    // Character image settings (when hero is anchor)
    characterImageUseCustom?: boolean; // true = use custom image, false/undefined = use hero portrait (cropped)
    characterImage?: string; // Custom character image (only used if characterImageUseCustom is true)
    characterImageCrop?: CropBounds; // Crop for the character image (defaults to hero's crop when using hero image)
}

// A content page (like "Healing Hearts", "Breaking Spades" for Gambit)
export interface ContentPage {
    id: string;
    title: string;
    icon?: string;
    abilities: Ability[];
}

// Fold/edge settings for the banner
export interface FoldSettings {
    startY: number; // Where the fold starts vertically (0-100, default 70)
    endX: number; // How far right the fold extends (0-100, default 75)
    thickness: number; // Fold thickness in % (1-20, default 5)
    brightness: number; // Brightness multiplier (1.0-1.5, default 1.3)
}

// Image banner position settings
export interface ImageBannerSettings {
    foldOffsetX: number; // Horizontal offset for fold (-50 to 50, default 0)
    foldOffsetY: number; // Vertical offset for fold (-50 to 50, default 0)
    bannerOffsetX: number; // Horizontal offset for banner (-50 to 50, default 0)
    foldRotation: number; // Rotation in degrees (-5 to 5, default 0.5)
}

// Display settings
export interface DisplaySettings {
    showRoleBadge: boolean; // Show role badge on portrait (default: false)
    controlScheme: ControlScheme; // PC or Console controls
    currentPage: number; // Current page index (0 = main page)
    showBackground: boolean; // Show background image instead of black
    customBackground?: string; // Custom background image (data URL)
    flipBackgroundHorizontally?: boolean; // Flip background image horizontally (default: false)
    foldSettings: FoldSettings; // Banner fold/edge settings
    useImageBanner: boolean; // Use image-based banner (true) or CSS-based (false)
    imageBannerSettings: ImageBannerSettings; // Position settings for image-based banner
    showUltimateLightning: boolean; // Show lightning overlay on ultimate icon (default: false)
    contentOffsetY: number; // Vertical offset for content sections (-100 to 100, default 0)
    abilitySpacing: number; // Spacing between abilities in pixels (0-24, default 16)
}

// Crop bounds as percentages
export interface CropBounds {
    top: number;    // 0-100 percentage from top
    left: number;   // 0-100 percentage from left
    right: number;  // 0-100 percentage from right
    bottom: number; // 0-100 percentage from bottom
}

// Hero image positioning
export interface HeroImageSettings {
    scale: number; // 0.5 to 3.0, default 1.0
    offsetX: number; // -100 to 100, percentage offset
    offsetY: number; // -100 to 100, percentage offset
    fadeAmount: number; // 0 to 100, how much fade on edges (default 50)
    // Visual crop bounds
    crop?: CropBounds;
}

// Hero info (name/difficulty) positioning
export interface HeroInfoSettings {
    offsetX: number; // horizontal offset
    offsetY: number; // vertical offset from bottom
}

// Hero logo position settings
export interface HeroLogoSettings {
    offsetX: number; // Horizontal offset (-50 to 50, default 0)
    offsetY: number; // Vertical offset (-50 to 50, default 0)
    scale: number; // Scale (0.5 to 2, default 1)
    crop?: CropBounds; // Optional crop bounds for the logo
}

export const getDefaultHeroLogoSettings = (): HeroLogoSettings => ({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
});

export interface HeroData {
    name: string;
    role: Role;
    difficulty: number; // 1-5
    portraitImage?: string;
    heroLogo?: string; // Hero logo image (appears in top-left of banner)
    heroLogoSettings?: HeroLogoSettings; // Logo position controls
    portraitSettings: HeroImageSettings; // Position and size controls
    heroInfoSettings: HeroInfoSettings; // Name/difficulty position controls
    bannerColor: string; // Base color for the gradient banner
    attacks: Attack[]; // 1+ attacks
    teamUpAbilities: TeamUpAbility[]; // 0+ team-ups (separate from passives)
    abilities: Ability[]; // 1+ abilities with custom hotkeys
    passives: Ability[]; // 0+ passives (appear at bottom of abilities column)
    ultimate: Ability; // Appears at TOP of abilities column
    additionalPages: ContentPage[]; // Additional pages (like Gambit's card forms)
    teamUpAnchor?: { // Team-up anchor info shown at bottom
        enabled: boolean;
        bonusText: string;
    };
}

// Helper to generate unique IDs
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};

// Console button options for dropdown selection
export const CONSOLE_BUTTON_OPTIONS = [
    // Face buttons
    { value: 'Triangle', label: 'Triangle (△)' },
    { value: 'Square', label: 'Square (□)' },
    { value: 'Circle', label: 'Circle (○)' },
    { value: 'X', label: 'X (✕)' },
    // Shoulder buttons
    { value: 'L1', label: 'L1' },
    { value: 'R1', label: 'R1' },
    { value: 'L2', label: 'L2' },
    { value: 'R2', label: 'R2' },
    // Stick clicks
    { value: 'L3', label: 'L3' },
    { value: 'R3', label: 'R3' },
    { value: 'L3+R3', label: 'L3 + R3' },
    // Combos
    { value: 'L1+R1', label: 'L1 + R1' },
    { value: 'L2+R2', label: 'L2 + R2' },
    // D-Pad
    { value: 'D-Pad', label: 'D-Pad' },
    { value: 'D-Pad Up', label: 'D-Pad Up' },
    { value: 'D-Pad Down', label: 'D-Pad Down' },
    { value: 'D-Pad Left', label: 'D-Pad Left' },
    { value: 'D-Pad Right', label: 'D-Pad Right' },
];

// Attack-specific console options (includes triggers)
export const CONSOLE_ATTACK_OPTIONS = [
    { value: 'R2', label: 'R2 (Primary Fire)' },
    { value: 'L2', label: 'L2 (Secondary Fire/Aim)' },
    ...CONSOLE_BUTTON_OPTIONS.filter(o => o.value !== 'R2' && o.value !== 'L2'),
];

// Map PC hotkeys to console equivalents
export const PC_TO_CONSOLE_MAP: Record<string, string> = {
    'LSHIFT': 'L1',
    'F': 'Triangle',
    'Q': 'L3+R3',
    'E': 'R1',
    'R': 'Square',
    'C': 'Circle',
    'V': 'X',
    'SPACE': 'X',
    'LMB': 'R2',
    'RMB': 'L2',
};

// Get console equivalent for a PC hotkey
export const getConsoleEquivalent = (pcHotkey: string): string => {
    const upper = pcHotkey.toUpperCase();
    return PC_TO_CONSOLE_MAP[upper] || pcHotkey;
};

// Team-ups always use D-Pad on console
export const CONSOLE_TEAMUP_DEFAULT = 'D-Pad';

export const createDefaultAttack = (): Attack => ({
    id: generateId(),
    name: 'ATTACK NAME',
    description: 'Attack description goes here.',
    hotkey: 'LMB',
    hotkeyConsole: 'R2',
});

export const createDefaultAbility = (hotkey: string = 'LSHIFT'): Ability => ({
    id: generateId(),
    name: 'ABILITY NAME',
    description: 'Ability description goes here.',
    hotkey,
    hotkeyConsole: getConsoleEquivalent(hotkey),
    isPassive: false,
});

export const createDefaultPassive = (): Ability => ({
    id: generateId(),
    name: 'PASSIVE NAME',
    description: 'Passive ability description.',
    hotkey: 'PASSIVE',
    isPassive: true,
});

export const createDefaultTeamUp = (): TeamUpAbility => ({
    id: generateId(),
    name: 'TEAM-UP NAME',
    description: 'Team-up ability description.',
    hotkey: 'Z',
    hotkeyConsole: CONSOLE_TEAMUP_DEFAULT, // Team-ups always D-Pad on console
    isAnchor: true, // Hero is anchor by default
});

export const getDefaultFoldSettings = (): FoldSettings => ({
    startY: 31,
    endX: 72,
    thickness: 10,
    brightness: 1.3,
});

export const getDefaultImageBannerSettings = (): ImageBannerSettings => ({
    foldOffsetX: 8,
    foldOffsetY: -15,
    bannerOffsetX: -5,
    foldRotation: 0.5,
});

export const getDefaultDisplaySettings = (): DisplaySettings => ({
    showRoleBadge: false,
    controlScheme: 'PC',
    currentPage: 0,
    showBackground: true, // Background on by default for better aesthetics
    customBackground: undefined,
    foldSettings: getDefaultFoldSettings(),
    useImageBanner: true, // Default to image-based banner
    imageBannerSettings: getDefaultImageBannerSettings(),
    showUltimateLightning: false, // Lightning off by default
    contentOffsetY: 0, // Content sections vertical offset
    abilitySpacing: 16, // Default spacing between abilities
});

export const createDefaultContentPage = (): ContentPage => ({
    id: generateId(),
    title: 'PAGE TITLE',
    abilities: [createDefaultAbility()],
});

export const getDefaultCropBounds = (): CropBounds => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
});

export const getDefaultPortraitSettings = (): HeroImageSettings => ({
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    fadeAmount: 50,
    crop: getDefaultCropBounds(),
});

export const getDefaultHeroInfoSettings = (): HeroInfoSettings => ({
    offsetX: 0,
    offsetY: 0,
});

export const getDefaultHeroData = (): HeroData => ({
    name: 'HERO NAME',
    role: 'Vanguard',
    difficulty: 1,
    bannerColor: '#dc2626', // Default red
    portraitSettings: getDefaultPortraitSettings(),
    heroInfoSettings: getDefaultHeroInfoSettings(),
    attacks: [
        {
            id: generateId(),
            name: 'ATTACK NAME',
            description: 'Attack description goes here.',
            hotkey: 'LMB',
            hotkeyConsole: 'R2',
        },
    ],
    teamUpAbilities: [
        {
            id: generateId(),
            name: 'TEAM-UP NAME',
            description: 'Team-up ability description goes here.',
            hotkey: 'Z',
            hotkeyConsole: 'D-Pad',
        },
    ],
    abilities: [
        {
            id: generateId(),
            name: 'ABILITY 1',
            description: 'First ability description.',
            hotkey: 'LSHIFT',
            hotkeyConsole: 'L1',
        },
        {
            id: generateId(),
            name: 'ABILITY 2',
            description: 'Second ability description.',
            hotkey: 'E',
            hotkeyConsole: 'R1',
        },
        {
            id: generateId(),
            name: 'ABILITY 3',
            description: 'Third ability description.',
            hotkey: 'F',
            hotkeyConsole: 'Triangle',
        },
    ],
    passives: [
        {
            id: generateId(),
            name: 'PASSIVE NAME',
            description: 'Passive ability description.',
            hotkey: 'PASSIVE',
            isPassive: true,
        },
    ],
    ultimate: {
        id: generateId(),
        name: 'ULTIMATE ABILITY',
        description: 'Ultimate ability description.',
        hotkey: 'Q',
        hotkeyConsole: 'L3+R3',
    },
    additionalPages: [],
    teamUpAnchor: {
        enabled: false,
        bonusText: '+5% Healing Bonus',
    },
});

// Preset templates
export interface HeroPreset {
    name: string;
    data: HeroData;
}

export const getDoctorStrangePreset = (): HeroData => ({
    name: 'DOCTOR STRANGE',
    role: 'Vanguard',
    difficulty: 2,
    bannerColor: '#dc2626', // Red
    portraitImage: '/heroes/doctorstrange.png',
    heroLogo: '/logos/doctor-strange.png',
    heroLogoSettings: {
        offsetX: -60,
        offsetY: 54,
        scale: 1.3,
    },
    portraitSettings: {
        scale: 1.1,
        offsetX: -7,
        offsetY: 25,
        fadeAmount: 50,
        crop: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 45,
        },
    },
    heroInfoSettings: {
        offsetX: 54,
        offsetY: 43,
    },
    attacks: [
        {
            id: generateId(),
            name: 'DAGGERS OF DENAK',
            description: 'Cast Daggers of Denak forward.',
            hotkey: 'LMB',
            hotkeyConsole: 'R2',
            icon: '/icons/doctor-strange/daggers-of-denak.png',
            iconScale: 0.9,
        },
    ],
    teamUpAbilities: [
        {
            id: generateId(),
            name: 'GAMMA MAELSTROM',
            description: 'Hulk charges Doctor Strange and Iron Man with gamma radiation. When Doctor Strange uses Maelstrom of Madness, he unleashes excess gamma energy. When Iron Man uses Armor Overdrive, he will initiate a gamma upgrade.',
            hotkey: 'E',
            hotkeyConsole: 'D-Pad',
            icon: '/icons/teamup-gammamaelstrom.png',
            isAnchor: false,
            anchorIcon: '/hero-icons/hulk_avatar.png',
            partnerIcons: ['/hero-icons/iron-man_avatar.png'],
            characterImageCrop: {
                top: 10.14,
                left: 51.62,
                right: 38.38,
                bottom: 77.07,
            },
        },
    ],
    abilities: [
        {
            id: generateId(),
            name: 'CLOAK OF LEVITATION',
            description: 'Ascend then enter a brief state of sustained flight.',
            hotkey: 'LSHIFT',
            hotkeyConsole: 'L1',
            icon: '/icons/doctor-strange/cloak-of-levitation.png',
            iconScale: 0.8,
        },
        {
            id: generateId(),
            name: 'MAELSTROM OF MADNESS',
            description: 'Release [orange]Dark Magic[/orange] to deal damage to nearby enemies.',
            hotkey: 'E',
            hotkeyConsole: 'R1',
            icon: '/icons/doctor-strange/maelstrom-of-madness.png',
            iconScale: 0.7,
        },
        {
            id: generateId(),
            name: 'PENTAGRAM OF FARALLAH',
            description: 'Open portals between two locations, enabling all units to travel through them.',
            hotkey: 'F',
            hotkeyConsole: 'Triangle',
            icon: '/icons/doctor-strange/pentagram-of-farallah.png',
            iconScale: 0.7,
        },
        {
            id: generateId(),
            name: 'SHIELD OF THE SERAPHIM',
            description: 'Create a protective barrier against damage.',
            hotkey: 'RMB',
            hotkeyConsole: 'L2',
            icon: '/icons/doctor-strange/shield-of-the-seraphim.png',
            iconScale: 0.9,
        },
    ],
    passives: [
        {
            id: generateId(),
            name: 'PRICE OF MAGIC',
            description: '[orange]Dark Magic[/orange] accumulates with every hit on an enemy. If [orange]Dark Magic[/orange] peaks for too long, Doctor Strange will be cursed with [blue]Anti-Heal[/blue].',
            hotkey: 'PASSIVE',
            isPassive: true,
            icon: '/icons/doctor-strange/price-of-magic.png',
            iconScale: 0.8,
        },
    ],
    ultimate: {
        id: generateId(),
        name: 'EYE OF AGAMOTTO',
        description: 'Separate nearby enemies\' [green]Souls[/green] from their bodies. Damage dealt to these [green]Souls[/green] is transferred to their physical bodies.',
        hotkey: 'Q',
        hotkeyConsole: 'L3+R3',
        icon: '/icons/doctor-strange/eye-of-agamotto.png',
    },
    additionalPages: [],
    teamUpAnchor: {
        enabled: false,
        bonusText: '',
    },
});

// Preset with optional display settings
export interface HeroPresetConfig {
    name: string;
    getData: () => HeroData;
    getDisplaySettings?: () => Partial<DisplaySettings>;
}

export const getSpotPreset = (): HeroData => ({
    name: 'THE SPOT',
    role: 'Strategist',
    difficulty: 5,
    bannerColor: '#8400ff', // Purple
    portraitImage: '/downloads/ChatGPT_Image_Feb_2__2026__03_57_45_AM-removebg-preview.png',
    heroLogo: '/logos/the-spot.png',
    heroLogoSettings: {
        offsetX: -93,
        offsetY: 67,
        scale: 1.5,
    },
    portraitSettings: {
        scale: 1.1,
        offsetX: -3,
        offsetY: 8,
        fadeAmount: 92,
        crop: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 21,
        },
    },
    heroInfoSettings: {
        offsetX: 30,
        offsetY: 80,
    },
    attacks: [
        {
            id: generateId(),
            name: 'RIFT STRIKE',
            description: 'Launch a piercing spot that heals allies and damages enemies. Attacks restore [green]Warps[/green], and accrue [orange]Internal Instability[/orange]. Attacks on enemies grant the user lifesteal increasing with [orange]Instability[/orange].',
            hotkey: 'LMB',
            hotkeyConsole: 'R2',
            icon: '/icons/doctor-strange/daggers-of-denak.png',
            iconScale: 0.9,
        },
    ],
    teamUpAbilities: [
        {
            id: generateId(),
            name: 'THAT HITS THE SPOT',
            description: 'Spot grants Spider-Man a portion of his extradimensional power. Spider-Man can fire out a pair of warp that function as persistent, indestructible portals for him alone.',
            hotkey: 'PASSIVE',
            hotkeyConsole: 'D-Pad',
            isPassive: true,
            isAnchor: true,
            partnerIcons: ['/hero-icons/spider-man_avatar.png'],
            icon: '/icons/teamup-gammamaelstrom.png',
            characterImageCrop: {
                top: 8,
                left: 37,
                right: 34,
                bottom: 65,
            },
        },
    ],
    abilities: [
        {
            id: generateId(),
            name: 'SLIP VAULT',
            description: 'Consume a [green]Warp[/green] to launch in any direction through a portal. Become [blue]Intangible[/blue] upon cast.',
            hotkey: 'LSHIFT',
            hotkeyConsole: 'L1',
            icon: '/icons/doctor-strange/cloak-of-levitation.png',
            iconScale: 0.8,
        },
        {
            id: generateId(),
            name: 'INTANGIBLE PARRY',
            description: 'Select between Mass Intake or Vector Reversal. MI: Consume a [green]Warp[/green] to protect self or an ally with a portal, reducing incoming damage and accruing [orange]Instability[/orange]. VR: Consume two [green]Warps[/green] to deflect all incoming projectiles.',
            hotkey: 'E',
            hotkeyConsole: 'R1',
            icon: '/icons/doctor-strange/shield-of-the-seraphim.png',
            iconScale: 0.9,
        },
        {
            id: generateId(),
            name: 'SPOTSTEP',
            description: 'Consume two [green]Warps[/green] to shoot a spot onto a surface or an ally. The spot heals allies within its radius, increasing with [orange]Instability[/orange]. At will, teleport to the spot, healing self and nearby allies.',
            hotkey: 'F',
            hotkeyConsole: 'Triangle',
            icon: '/icons/doctor-strange/pentagram-of-farallah.png',
            iconScale: 0.7,
        },
        {
            id: generateId(),
            name: 'EVENT BREAK',
            description: 'Unleash all stored [orange]Instability[/orange] upon a selected target, healing allies and damaging enemies. Consume a [green]Warp[/green] right after to teleport towards the target, launching enemy targets upwards. Break with no target to vent [orange]Instability[/orange], unleashing energy in a small radius and restoring [green]Warps[/green].',
            hotkey: 'RMB',
            hotkeyConsole: 'L2',
            icon: '/icons/doctor-strange/maelstrom-of-madness.png',
            iconScale: 0.7,
        },
    ],
    passives: [
        {
            id: generateId(),
            name: 'INTERNAL INSTABILITY',
            description: 'Internal Instability accumulates with blocking. If Instability peaks for too long, Spot receives [blue]Anti-Heal[/blue] for a short period, and the energy is released in a burst around him, launching him upwards.',
            hotkey: 'PASSIVE',
            isPassive: true,
            icon: '/icons/doctor-strange/price-of-magic.png',
            iconScale: 0.8,
        },
    ],
    ultimate: {
        id: generateId(),
        name: 'GRAVITY WELL',
        description: 'Anchor and create a grounded disk that can be remotely piloted. Enemies above are [orange]grounded[/orange] and have mobility [blue]suppressed[/blue]. Enemy projectiles are absorbed while [green]healing energy[/green] radiates from Spot\'s anchor. Finally, absorbed energy is released in a concussive pulse, launching enemies upwards.',
        hotkey: 'Q',
        hotkeyConsole: 'L3+R3',
        icon: '/icons/doctor-strange/eye-of-agamotto.png',
    },
    additionalPages: [],
    teamUpAnchor: {
        enabled: false,
        bonusText: '',
    },
});

// All available presets
export const HERO_PRESETS: HeroPresetConfig[] = [
    { 
        name: 'Doctor Strange', 
        getData: getDoctorStrangePreset,
        getDisplaySettings: () => ({
            customBackground: '/backgrounds/q80thme87oag1.jpg',
            showBackground: true,
            contentOffsetY: 25,
            abilitySpacing: 16,
        }),
    },
    { 
        name: 'The Spot', 
        getData: getSpotPreset,
        getDisplaySettings: () => ({
            customBackground: '/backgrounds/marvel-rivals-main-menu-screen-2.png',
            showBackground: true,
            contentOffsetY: 78,
            abilitySpacing: 0,
        }),
    },
];

// All available hero icons for team-up selection
export const HERO_ICONS: { name: string; path: string }[] = [
    { name: 'Adam Warlock', path: '/hero-icons/adam-warlock_avatar.png' },
    { name: 'Angela', path: '/hero-icons/angela_avatar.png' },
    { name: 'Black Panther', path: '/hero-icons/black-panther_avatar.png' },
    { name: 'Black Widow', path: '/hero-icons/black-widow_avatar.png' },
    { name: 'Blade', path: '/hero-icons/blade_avatar.png' },
    { name: 'Captain America', path: '/hero-icons/captain-america_avatar.png' },
    { name: 'Cloak & Dagger', path: '/hero-icons/cloak-and-dagger_avatar.png' },
    { name: 'Daredevil', path: '/hero-icons/daredevil_avatar.png' },
    { name: 'Deadpool', path: '/hero-icons/deadpool_avatar.png' },
    { name: 'Doctor Strange', path: '/hero-icons/doctor-strange_avatar.png' },
    { name: 'Emma Frost', path: '/hero-icons/emma-frost_avatar.png' },
    { name: 'Gambit', path: '/hero-icons/gambit_avatar.png' },
    { name: 'Groot', path: '/hero-icons/groot_avatar.png' },
    { name: 'Hawkeye', path: '/hero-icons/hawkeye_avatar.png' },
    { name: 'Hela', path: '/hero-icons/hela_avatar.png' },
    { name: 'Hulk', path: '/hero-icons/hulk_avatar.png' },
    { name: 'Human Torch', path: '/hero-icons/human-torch_avatar.png' },
    { name: 'Invisible Woman', path: '/hero-icons/invisible-woman_avatar.png' },
    { name: 'Iron Fist', path: '/hero-icons/iron-fist_avatar.png' },
    { name: 'Iron Man', path: '/hero-icons/iron-man_avatar.png' },
    { name: 'Jeff', path: '/hero-icons/jeff-the-land-shark_avatar.png' },
    { name: 'Loki', path: '/hero-icons/loki_avatar.png' },
    { name: 'Luna Snow', path: '/hero-icons/luna-snow_avatar.png' },
    { name: 'Magik', path: '/hero-icons/magik_avatar.png' },
    { name: 'Magneto', path: '/hero-icons/magneto_avatar.png' },
    { name: 'Mantis', path: '/hero-icons/mantis_avatar.png' },
    { name: 'Mister Fantastic', path: '/hero-icons/mister-fantastic_avatar.png' },
    { name: 'Moon Knight', path: '/hero-icons/moon-knight_avatar.png' },
    { name: 'Namor', path: '/hero-icons/namor_avatar.png' },
    { name: 'Peni Parker', path: '/hero-icons/peni-parker_avatar.png' },
    { name: 'Phoenix', path: '/hero-icons/phoenix_avatar.png' },
    { name: 'Psylocke', path: '/hero-icons/psylocke_avatar.png' },
    { name: 'Rocket Raccoon', path: '/hero-icons/rocket-raccoon_avatar.png' },
    { name: 'Rogue', path: '/hero-icons/rogue_avatar.png' },
    { name: 'Scarlet Witch', path: '/hero-icons/scarlet-witch_avatar.png' },
    { name: 'Spider-Man', path: '/hero-icons/spider-man_avatar.png' },
    { name: 'Squirrel Girl', path: '/hero-icons/squirrel-girl_avatar.png' },
    { name: 'Star-Lord', path: '/hero-icons/star-lord_avatar.png' },
    { name: 'Storm', path: '/hero-icons/storm_avatar.png' },
    { name: 'The Punisher', path: '/hero-icons/the-punisher_avatar.png' },
    { name: 'The Thing', path: '/hero-icons/the-thing_avatar.png' },
    { name: 'Thor', path: '/hero-icons/thor_avatar.png' },
    { name: 'Ultron', path: '/hero-icons/ultron_avatar.png' },
    { name: 'Venom', path: '/hero-icons/venom_avatar.png' },
    { name: 'Winter Soldier', path: '/hero-icons/winter-soldier_avatar.png' },
    { name: 'Wolverine', path: '/hero-icons/wolverine_avatar.png' },
];

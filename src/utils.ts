import { domToPng } from 'modern-screenshot';
import { HeroData, DisplaySettings, HeroTemplate, getDefaultPortraitSettings, getDefaultHeroInfoSettings } from './types';

// Preload images used by presets to improve switching speed
export const preloadPresetImages = (): void => {
    const imagesToPreload = [
        // Doctor Strange preset
        '/heroes/doctorstrange.png',
        '/logos/doctor-strange.png',
        '/icons/doctor-strange/daggers-of-denak.png',
        '/icons/doctor-strange/cloak-of-levitation.png',
        '/icons/doctor-strange/maelstrom-of-madness.png',
        '/icons/doctor-strange/pentagram-of-farallah.png',
        '/icons/doctor-strange/shield-of-the-seraphim.png',
        '/icons/doctor-strange/price-of-magic.png',
        '/icons/doctor-strange/eye-of-agamotto.png',
        '/icons/teamup-gammamaelstrom.png',
        // The Spot preset
        '/downloads/ChatGPT_Image_Feb_2__2026__03_57_45_AM-removebg-preview.png',
        '/logos/the-spot.png',
        // Common backgrounds
        '/backgrounds/marvel-rivals-main-menu-screen.png',
        // Hero icons (commonly used in team-ups)
        '/hero-icons/hulk_avatar.png',
        '/hero-icons/doctor-strange_avatar.png',
        '/hero-icons/iron-man_avatar.png',
        '/hero-icons/spider-man_avatar.png',
    ];

    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

export const exportToPNG = async (element: HTMLElement, filename: string): Promise<void> => {
    try {
        // Find the scale wrapper (parent element with transform)
        const scaleWrapper = element.parentElement;
        let originalTransform = '';
        
        if (scaleWrapper) {
            originalTransform = scaleWrapper.style.transform;
            scaleWrapper.style.transform = 'none';
        }

        // Hide elements with 'no-export' class before capture
        const noExportElements = element.querySelectorAll('.no-export');
        noExportElements.forEach((el) => {
            (el as HTMLElement).style.visibility = 'hidden';
        });

        // Wait for layout to update
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));

        // Export at 3x scale for high resolution (1280x720 -> 3840x2160)
        const dataUrl = await domToPng(element, {
            scale: 3,
            backgroundColor: '#0a0a0a',
        });

        // Restore transform
        if (scaleWrapper) {
            scaleWrapper.style.transform = originalTransform;
        }

        // Restore visibility
        noExportElements.forEach((el) => {
            (el as HTMLElement).style.visibility = '';
        });

        // Download the file
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error exporting to PNG:', error);
        throw error;
    }
};

export const openInNewTab = async (element: HTMLElement, filename: string): Promise<void> => {
    try {
        // Find the scale wrapper (parent element with transform)
        const scaleWrapper = element.parentElement;
        let originalTransform = '';
        
        if (scaleWrapper) {
            originalTransform = scaleWrapper.style.transform;
            scaleWrapper.style.transform = 'none';
        }

        // Hide elements with 'no-export' class before capture
        const noExportElements = element.querySelectorAll('.no-export');
        noExportElements.forEach((el) => {
            (el as HTMLElement).style.visibility = 'hidden';
        });

        // Wait for layout to update
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));

        // Export at 3x scale for high resolution (1280x720 -> 3840x2160)
        const dataUrl = await domToPng(element, {
            scale: 3,
            backgroundColor: '#0a0a0a',
        });

        // Restore transform
        if (scaleWrapper) {
            scaleWrapper.style.transform = originalTransform;
        }

        // Restore visibility
        noExportElements.forEach((el) => {
            (el as HTMLElement).style.visibility = '';
        });

        // Open in new tab
        const newTab = window.open();
        if (newTab) {
            newTab.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${filename}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        html, body {
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                        }
                        body {
                            background: #0a0a0a;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        img {
                            max-width: 100vw;
                            max-height: 100vh;
                            object-fit: contain;
                            box-shadow: 0 4px 30px rgba(0,0,0,0.8);
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" alt="${filename}" />
                </body>
                </html>
            `);
            newTab.document.close();
        }
    } catch (error) {
        console.error('Error opening in new tab:', error);
        throw error;
    }
};

export const getRoleColor = (role: string): string => {
    switch (role) {
        case 'Strategist':
            return '#4CAF50'; // Green
        case 'Duelist':
            return '#F44336'; // Red
        case 'Vanguard':
            return '#2196F3'; // Blue
        default:
            return '#9E9E9E'; // Gray
    }
};

export const getRoleBadgeColor = (role: string): string => {
    switch (role) {
        case 'Strategist':
            return '#22c55e'; // Bright green
        case 'Duelist':
            return '#ef4444'; // Bright red
        case 'Vanguard':
            return '#3b82f6'; // Bright blue
        default:
            return '#6b7280'; // Gray
    }
};

export const getRoleAbbreviation = (role: string): string => {
    switch (role) {
        case 'Strategist':
            return 'STR';
        case 'Duelist':
            return 'DUE';
        case 'Vanguard':
            return 'VAN';
        default:
            return '???';
    }
};

// Color highlight mapping
const colorMap: Record<string, string> = {
    green: '#22c55e',
    blue: '#60a5fa', 
    orange: '#f59e0b',
};

// Parse text with color tags like [green]Souls[/green]
// Returns array of { text, color? } segments
export interface TextSegment {
    text: string;
    color?: string;
}

export const parseColoredText = (text: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    const regex = /\[(green|blue|orange)\](.*?)\[\/\1\]/gi;
    
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
            segments.push({ text: text.slice(lastIndex, match.index) });
        }
        
        // Add colored text
        const colorName = match[1].toLowerCase();
        segments.push({ 
            text: match[2], 
            color: colorMap[colorName] || colorMap.orange 
        });
        
        lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex) });
    }
    
    return segments.length > 0 ? segments : [{ text }];
};

// Template version for schema migrations
const TEMPLATE_VERSION = 1;

/**
 * Export the current hero configuration as a downloadable JSON file
 */
export const downloadTemplate = (heroData: HeroData, displaySettings: DisplaySettings): void => {
    const template: HeroTemplate = {
        version: TEMPLATE_VERSION,
        name: heroData.name || 'Untitled Hero',
        exportedAt: new Date().toISOString(),
        heroData,
        displaySettings: {
            showRoleBadge: displaySettings.showRoleBadge,
            controlScheme: displaySettings.controlScheme,
            showBackground: displaySettings.showBackground,
            customBackground: displaySettings.customBackground,
            foldSettings: displaySettings.foldSettings,
            useImageBanner: displaySettings.useImageBanner,
            imageBannerSettings: displaySettings.imageBannerSettings,
            showUltimateLightning: displaySettings.showUltimateLightning,
            contentOffsetY: displaySettings.contentOffsetY,
            abilitySpacing: displaySettings.abilitySpacing,
        },
    };

    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create filename from hero name
    const safeName = (heroData.name || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const filename = `${safeName}-template.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
};

/**
 * Parse and validate an imported template file
 */
export const parseTemplateFile = (fileContent: string): HeroTemplate => {
    let parsed: unknown;
    
    try {
        parsed = JSON.parse(fileContent);
    } catch {
        throw new Error('Invalid JSON file. Please select a valid template file.');
    }
    
    // Basic validation
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid template format.');
    }
    
    const template = parsed as Record<string, unknown>;
    
    // Check for required fields
    if (!template.heroData || typeof template.heroData !== 'object') {
        throw new Error('Template is missing hero data.');
    }
    
    // Check hero data has required fields
    const heroData = template.heroData as Record<string, unknown>;
    if (typeof heroData.name !== 'string') {
        throw new Error('Template hero data is missing a name.');
    }
    
    // Ensure version exists (default to 1 for older templates)
    if (typeof template.version !== 'number') {
        template.version = 1;
    }
    
    // Apply defensive defaults for arrays that might be missing or corrupted
    // This ensures the app doesn't crash if someone loads a partial/hand-edited template
    if (!Array.isArray(heroData.attacks)) {
        heroData.attacks = [];
    }
    if (!Array.isArray(heroData.abilities)) {
        heroData.abilities = [];
    }
    if (!Array.isArray(heroData.passives)) {
        heroData.passives = [];
    }
    if (!Array.isArray(heroData.teamUpAbilities)) {
        heroData.teamUpAbilities = [];
    }
    if (!Array.isArray(heroData.additionalPages)) {
        heroData.additionalPages = [];
    }
    
    // Ensure ultimate exists with sensible defaults
    if (!heroData.ultimate || typeof heroData.ultimate !== 'object') {
        heroData.ultimate = {
            id: 'default-ult',
            name: 'ULTIMATE',
            description: 'Ultimate ability description.',
            hotkey: 'Q',
            hotkeyConsole: 'L1+R1',
        };
    }
    
    // Ensure required string/number fields have defaults
    if (typeof heroData.role !== 'string') {
        heroData.role = 'Vanguard';
    }
    if (typeof heroData.difficulty !== 'number') {
        heroData.difficulty = 1;
    }
    if (typeof heroData.bannerColor !== 'string') {
        heroData.bannerColor = '#dc2626';
    }
    
    // Ensure settings objects exist with sensible defaults
    if (!heroData.portraitSettings || typeof heroData.portraitSettings !== 'object') {
        heroData.portraitSettings = getDefaultPortraitSettings();
    }
    if (!heroData.heroInfoSettings || typeof heroData.heroInfoSettings !== 'object') {
        heroData.heroInfoSettings = getDefaultHeroInfoSettings();
    }
    
    // Future: Add migration logic for older versions here
    // if (template.version < TEMPLATE_VERSION) {
    //     template = migrateTemplate(template);
    // }
    
    return template as unknown as HeroTemplate;
};

/**
 * Load a template file and return the parsed data
 * Returns a promise that resolves with the template data or rejects with an error
 */
export const loadTemplateFromFile = (file: File): Promise<HeroTemplate> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const template = parseTemplateFile(content);
                resolve(template);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read the file.'));
        };
        
        reader.readAsText(file);
    });
};

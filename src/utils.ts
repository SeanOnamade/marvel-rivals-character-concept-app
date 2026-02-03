import { domToPng } from 'modern-screenshot';

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

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error exporting to PNG:', error);
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

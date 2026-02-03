import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeroData, Role, Attack, Ability, TeamUpAbility, DisplaySettings, ContentPage, CropBounds, createDefaultAttack, createDefaultAbility, createDefaultTeamUp, createDefaultPassive, createDefaultContentPage, getDefaultPortraitSettings, getDefaultHeroInfoSettings, getDefaultCropBounds, getDefaultHeroData, getDefaultFoldSettings, HERO_PRESETS, HERO_ICONS, CONSOLE_BUTTON_OPTIONS, CONSOLE_ATTACK_OPTIONS } from '../types';
import { Plus, Trash2, Upload, Monitor, Gamepad2, ChevronDown, ChevronUp, ChevronRight, Move, Type, Crop, GripVertical } from 'lucide-react';
import ImageCropEditor from './ImageCropEditor';

interface FormEditorProps {
    heroData: HeroData;
    onChange: (data: HeroData) => void;
    displaySettings: DisplaySettings;
    onDisplaySettingsChange: (settings: DisplaySettings) => void;
}

interface IconUploadProps {
    icon?: string;
    onUpload: (dataUrl: string) => void;
    size?: 'sm' | 'md';
}

const IconUpload: React.FC<IconUploadProps> = ({ icon, onUpload, size = 'md' }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onUpload(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const sizeClasses = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';

    return (
        <label className={`${sizeClasses} border border-marvel-border bg-marvel-dark rounded cursor-pointer flex items-center justify-center overflow-hidden hover:border-marvel-yellow transition-colors`}>
            {icon ? (
                <img src={icon} alt="Icon" className="w-full h-full object-cover" />
            ) : (
                <Upload className="w-4 h-4 text-gray-500" />
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
    );
};

// Color text helper - buttons to wrap selected text with color tags
interface ColoredTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

const ColoredTextarea: React.FC<ColoredTextareaProps> = ({ value, onChange, placeholder, rows = 2 }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const wrapWithColor = (color: 'green' | 'blue' | 'orange') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        if (selectedText) {
            // Wrap selected text with color tags
            const newValue = 
                value.substring(0, start) + 
                `[${color}]${selectedText}[/${color}]` + 
                value.substring(end);
            onChange(newValue);
        } else {
            // Insert empty color tags at cursor
            const newValue = 
                value.substring(0, start) + 
                `[${color}][/${color}]` + 
                value.substring(end);
            onChange(newValue);
            // Move cursor between tags
            setTimeout(() => {
                textarea.focus();
                const newPos = start + color.length + 2;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        }
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-500 mr-1">Colors:</span>
                <button
                    type="button"
                    onClick={() => wrapWithColor('green')}
                    className="w-5 h-5 rounded bg-green-500 hover:bg-green-400 transition-colors text-[10px] font-bold text-white"
                    title="Green (select text first)"
                >
                    G
                </button>
                <button
                    type="button"
                    onClick={() => wrapWithColor('blue')}
                    className="w-5 h-5 rounded bg-blue-500 hover:bg-blue-400 transition-colors text-[10px] font-bold text-white"
                    title="Blue (select text first)"
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => wrapWithColor('orange')}
                    className="w-5 h-5 rounded bg-orange-500 hover:bg-orange-400 transition-colors text-[10px] font-bold text-white"
                    title="Orange (select text first)"
                >
                    O
                </button>
                <span className="text-xs text-gray-600 ml-1">(select text, then click)</span>
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-marvel-dark border border-marvel-border rounded px-3 py-2 text-white text-sm focus:border-marvel-yellow focus:outline-none resize-y min-h-[60px]"
                placeholder={placeholder}
                rows={rows}
            />
        </div>
    );
};

// Console button dropdown selector
interface ConsoleButtonSelectProps {
    value: string;
    onChange: (value: string) => void;
    options?: { value: string; label: string }[];
    placeholder?: string;
}

const ConsoleButtonSelect: React.FC<ConsoleButtonSelectProps> = ({ 
    value, 
    onChange, 
    options = CONSOLE_BUTTON_OPTIONS,
    placeholder = 'Console Button' 
}) => {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white cursor-pointer hover:border-marvel-yellow focus:border-marvel-yellow focus:outline-none"
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

// Preset banner colors
const BANNER_PRESETS = [
    { name: 'Red', color: '#dc2626' },
    { name: 'Blue', color: '#2563eb' },
    { name: 'Green', color: '#16a34a' },
    { name: 'Purple', color: '#9333ea' },
    { name: 'Orange', color: '#ea580c' },
    { name: 'Pink', color: '#db2777' },
    { name: 'Teal', color: '#0d9488' },
    { name: 'Yellow', color: '#ca8a04' },
];

const FormEditor: React.FC<FormEditorProps> = ({ heroData, onChange, displaySettings, onDisplaySettingsChange }) => {
    const [showCropEditor, setShowCropEditor] = useState(false);
    const [foldExpanded, setFoldExpanded] = useState(false);
    const [heroImageExpanded, setHeroImageExpanded] = useState(false);
    const [heroNameExpanded, setHeroNameExpanded] = useState(false);
    const [imageBannerExpanded, setImageBannerExpanded] = useState(false);
    
    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState<{ type: string; index: number } | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    
    // Auto-scroll during drag
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const SCROLL_ZONE_SIZE = 80; // pixels from edge to trigger scroll
    const SCROLL_SPEED = 8; // pixels per frame

    const handleAutoScroll = useCallback((e: React.DragEvent) => {
        if (!scrollContainerRef.current || !draggedItem) return;
        
        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const mouseY = e.clientY;
        
        // Clear any existing scroll interval
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
        
        // Check if near top edge
        if (mouseY < rect.top + SCROLL_ZONE_SIZE) {
            const intensity = 1 - (mouseY - rect.top) / SCROLL_ZONE_SIZE;
            scrollIntervalRef.current = setInterval(() => {
                container.scrollTop -= SCROLL_SPEED * intensity;
            }, 16);
        }
        // Check if near bottom edge
        else if (mouseY > rect.bottom - SCROLL_ZONE_SIZE) {
            const intensity = 1 - (rect.bottom - mouseY) / SCROLL_ZONE_SIZE;
            scrollIntervalRef.current = setInterval(() => {
                container.scrollTop += SCROLL_SPEED * intensity;
            }, 16);
        }
    }, [draggedItem]);

    // Clean up scroll interval on drag end
    useEffect(() => {
        if (!draggedItem && scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    }, [draggedItem]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
            }
        };
    }, []);

    const updateField = <K extends keyof HeroData>(field: K, value: HeroData[K]) => {
        onChange({ ...heroData, [field]: value });
    };

    // Helper to swap array items
    const swapArrayItems = <T,>(arr: T[], fromIndex: number, toIndex: number): T[] => {
        const newArr = [...arr];
        // Swap the two items
        [newArr[fromIndex], newArr[toIndex]] = [newArr[toIndex], newArr[fromIndex]];
        return newArr;
    };

    // Reorder functions for drag and drop (swap behavior)
    const reorderAttacks = (fromIndex: number, toIndex: number) => {
        onChange({ ...heroData, attacks: swapArrayItems(heroData.attacks, fromIndex, toIndex) });
    };

    const reorderAbilities = (fromIndex: number, toIndex: number) => {
        onChange({ ...heroData, abilities: swapArrayItems(heroData.abilities, fromIndex, toIndex) });
    };

    const reorderTeamUps = (fromIndex: number, toIndex: number) => {
        onChange({ ...heroData, teamUpAbilities: swapArrayItems(heroData.teamUpAbilities, fromIndex, toIndex) });
    };

    const reorderPassives = (fromIndex: number, toIndex: number) => {
        onChange({ ...heroData, passives: swapArrayItems(heroData.passives, fromIndex, toIndex) });
    };

    // Drag handlers
    const handleDragStart = (type: string, index: number) => {
        setDraggedItem({ type, index });
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverIndex(null);
        // Clear auto-scroll
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const handleDrop = (type: string, toIndex: number) => {
        if (!draggedItem || draggedItem.type !== type) return;
        
        const fromIndex = draggedItem.index;
        if (fromIndex === toIndex) {
            handleDragEnd();
            return;
        }

        switch (type) {
            case 'attack':
                reorderAttacks(fromIndex, toIndex);
                break;
            case 'ability':
                reorderAbilities(fromIndex, toIndex);
                break;
            case 'teamup':
                reorderTeamUps(fromIndex, toIndex);
                break;
            case 'passive':
                reorderPassives(fromIndex, toIndex);
                break;
        }
        
        handleDragEnd();
    };

    const handleCropApply = (crop: CropBounds) => {
        updateField('portraitSettings', {
            ...heroData.portraitSettings || getDefaultPortraitSettings(),
            crop,
        });
        setShowCropEditor(false);
    };

    const updateDisplaySetting = <K extends keyof DisplaySettings>(field: K, value: DisplaySettings[K]) => {
        onDisplaySettingsChange({ ...displaySettings, [field]: value });
    };

    // Attack handlers
    const updateAttack = (id: string, field: keyof Attack, value: string | number) => {
        const newAttacks = heroData.attacks.map(attack =>
            attack.id === id ? { ...attack, [field]: value } : attack
        );
        onChange({ ...heroData, attacks: newAttacks });
    };

    const addAttack = () => {
        onChange({ ...heroData, attacks: [...heroData.attacks, createDefaultAttack()] });
    };

    const removeAttack = (id: string) => {
        if (heroData.attacks.length > 1) {
            onChange({ ...heroData, attacks: heroData.attacks.filter(a => a.id !== id) });
        }
    };

    // Team-up handlers
    const updateTeamUp = (id: string, field: keyof TeamUpAbility, value: string | number | boolean | undefined) => {
        const newTeamUps = heroData.teamUpAbilities.map(tu =>
            tu.id === id ? { ...tu, [field]: value } : tu
        );
        onChange({ ...heroData, teamUpAbilities: newTeamUps });
    };

    const addTeamUp = () => {
        onChange({ ...heroData, teamUpAbilities: [...heroData.teamUpAbilities, createDefaultTeamUp()] });
    };

    const removeTeamUp = (id: string) => {
        onChange({ ...heroData, teamUpAbilities: heroData.teamUpAbilities.filter(tu => tu.id !== id) });
    };

    // Team-up partner icons handlers
    const addPartnerIcon = (teamUpId: string, iconUrl: string) => {
        const newTeamUps = heroData.teamUpAbilities.map(tu => {
            if (tu.id === teamUpId) {
                const currentIcons = tu.partnerIcons || [];
                return { ...tu, partnerIcons: [...currentIcons, iconUrl] };
            }
            return tu;
        });
        onChange({ ...heroData, teamUpAbilities: newTeamUps });
    };

    const removePartnerIcon = (teamUpId: string, iconIndex: number) => {
        const newTeamUps = heroData.teamUpAbilities.map(tu => {
            if (tu.id === teamUpId) {
                const newIcons = [...(tu.partnerIcons || [])];
                newIcons.splice(iconIndex, 1);
                return { ...tu, partnerIcons: newIcons };
            }
            return tu;
        });
        onChange({ ...heroData, teamUpAbilities: newTeamUps });
    };

    // Ability handlers
    const updateAbility = (id: string, field: keyof Ability, value: string | number | boolean) => {
        const newAbilities = heroData.abilities.map(ability =>
            ability.id === id ? { ...ability, [field]: value } : ability
        );
        onChange({ ...heroData, abilities: newAbilities });
    };

    const addAbility = () => {
        const hotkeys = ['LSHIFT', 'E', 'F', 'R', 'SPACE', 'C', 'V'];
        const usedHotkeys = heroData.abilities.map(a => a.hotkey);
        const nextHotkey = hotkeys.find(h => !usedHotkeys.includes(h)) || 'KEY';
        onChange({ ...heroData, abilities: [...heroData.abilities, createDefaultAbility(nextHotkey)] });
    };

    const removeAbility = (id: string) => {
        if (heroData.abilities.length > 1) {
            onChange({ ...heroData, abilities: heroData.abilities.filter(a => a.id !== id) });
        }
    };

    // Passive handlers
    const updatePassive = (id: string, field: keyof Ability, value: string | number | boolean) => {
        const newPassives = heroData.passives.map(passive =>
            passive.id === id ? { ...passive, [field]: value } : passive
        );
        onChange({ ...heroData, passives: newPassives });
    };

    const addPassive = () => {
        onChange({ ...heroData, passives: [...heroData.passives, createDefaultPassive()] });
    };

    const removePassive = (id: string) => {
        onChange({ ...heroData, passives: heroData.passives.filter(p => p.id !== id) });
    };

    // Ultimate handlers
    const updateUltimate = (field: keyof Ability, value: string | number | boolean) => {
        onChange({ ...heroData, ultimate: { ...heroData.ultimate, [field]: value } });
    };

    // Team-up anchor handlers
    const updateTeamUpAnchor = (enabled: boolean, bonusText?: string) => {
        onChange({ 
            ...heroData, 
            teamUpAnchor: { 
                enabled, 
                bonusText: bonusText ?? heroData.teamUpAnchor?.bonusText ?? '+5% Healing Bonus' 
            } 
        });
    };

    // Additional pages handlers
    const addPage = () => {
        onChange({ ...heroData, additionalPages: [...(heroData.additionalPages || []), createDefaultContentPage()] });
    };

    const removePage = (id: string) => {
        onChange({ ...heroData, additionalPages: heroData.additionalPages?.filter(p => p.id !== id) || [] });
    };

    const updatePage = (id: string, field: keyof ContentPage, value: string) => {
        const newPages = heroData.additionalPages?.map(page =>
            page.id === id ? { ...page, [field]: value } : page
        ) || [];
        onChange({ ...heroData, additionalPages: newPages });
    };

    const addAbilityToPage = (pageId: string) => {
        const newPages = heroData.additionalPages?.map(page =>
            page.id === pageId ? { ...page, abilities: [...page.abilities, createDefaultAbility()] } : page
        ) || [];
        onChange({ ...heroData, additionalPages: newPages });
    };

    const removeAbilityFromPage = (pageId: string, abilityId: string) => {
        const newPages = heroData.additionalPages?.map(page =>
            page.id === pageId ? { ...page, abilities: page.abilities.filter(a => a.id !== abilityId) } : page
        ) || [];
        onChange({ ...heroData, additionalPages: newPages });
    };

    const updatePageAbility = (pageId: string, abilityId: string, field: keyof Ability, value: string | boolean) => {
        const newPages = heroData.additionalPages?.map(page => {
            if (page.id === pageId) {
                const newAbilities = page.abilities.map(a =>
                    a.id === abilityId ? { ...a, [field]: value } : a
                );
                return { ...page, abilities: newAbilities };
            }
            return page;
        }) || [];
        onChange({ ...heroData, additionalPages: newPages });
    };

    // Toggle team-up isPassive
    const toggleTeamUpPassive = (id: string) => {
        const newTeamUps = heroData.teamUpAbilities.map(tu =>
            tu.id === id ? { ...tu, isPassive: !tu.isPassive } : tu
        );
        onChange({ ...heroData, teamUpAbilities: newTeamUps });
    };

    const hotkeyLabel = displaySettings.controlScheme === 'PC' ? 'PC Hotkey' : 'Console Button';

    return (
        <div 
            ref={scrollContainerRef}
            className="bg-marvel-metal rounded-lg p-6 h-full overflow-y-auto"
            onDragOver={handleAutoScroll}
        >
            <h2 className="text-2xl font-bold mb-6 text-marvel-yellow uppercase tracking-wider">
                Hero Editor
            </h2>

            {/* Preset Templates */}
            <div className="mb-6 p-4 bg-marvel-dark rounded-lg border border-marvel-border">
                <h3 className="text-lg font-semibold mb-3 text-marvel-accent">Quick Start</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            onChange(getDefaultHeroData());
                            // Reset display settings to defaults
                            onDisplaySettingsChange({
                                ...displaySettings,
                                contentOffsetY: 0,
                                abilitySpacing: 16,
                                showBackground: false,
                                customBackground: undefined,
                            });
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                    >
                        New Blank Template
                    </button>
                    {HERO_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => {
                                onChange(preset.getData());
                                if (preset.getDisplaySettings) {
                                    const presetDisplaySettings = preset.getDisplaySettings();
                                    onDisplaySettingsChange({
                                        ...displaySettings,
                                        ...presetDisplaySettings,
                                    });
                                }
                            }}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                        >
                            Load {preset.name}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Load a preset template or start fresh. Your current work will be replaced.</p>
            </div>

            {/* Display Settings */}
            <div className="mb-6 p-4 bg-marvel-dark rounded-lg border border-marvel-border">
                <h3 className="text-lg font-semibold mb-4 text-marvel-accent">Display Settings</h3>

                {/* Control Scheme Toggle */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Control Scheme</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateDisplaySetting('controlScheme', 'PC')}
                            className={`flex items-center gap-2 px-4 py-2 rounded ${
                                displaySettings.controlScheme === 'PC'
                                    ? 'bg-marvel-yellow text-black'
                                    : 'bg-marvel-metal text-white border border-marvel-border'
                            }`}
                        >
                            <Monitor className="w-4 h-4" /> PC
                        </button>
                        <button
                            onClick={() => updateDisplaySetting('controlScheme', 'Console')}
                            className={`flex items-center gap-2 px-4 py-2 rounded ${
                                displaySettings.controlScheme === 'Console'
                                    ? 'bg-marvel-yellow text-black'
                                    : 'bg-marvel-metal text-white border border-marvel-border'
                            }`}
                        >
                            <Gamepad2 className="w-4 h-4" /> Console
                        </button>
                    </div>
                </div>

                {/* Role Badge Toggle */}
                <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={displaySettings.showRoleBadge}
                            onChange={(e) => updateDisplaySetting('showRoleBadge', e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">Show Role Badge</span>
                    </label>
                </div>

                {/* Ultimate Lightning Toggle */}
                <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={displaySettings.showUltimateLightning === true}
                            onChange={(e) => updateDisplaySetting('showUltimateLightning', e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">Show Ultimate Lightning</span>
                    </label>
                </div>

                {/* Banner Style Toggle */}
                <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={displaySettings.useImageBanner}
                            onChange={(e) => updateDisplaySetting('useImageBanner', e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">Use Image Banner</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-8 mt-1">
                        {displaySettings.useImageBanner 
                            ? 'Using image-based banner (matches template)' 
                            : 'Using CSS banner (better color accuracy)'}
                    </p>
                    
                    {/* Image Banner Position Controls - Collapsible */}
                    {displaySettings.useImageBanner && (
                        <div className="ml-8 mt-3 p-3 bg-marvel-dark rounded border border-marvel-border">
                            <button
                                onClick={() => setImageBannerExpanded(!imageBannerExpanded)}
                                className="w-full flex items-center justify-between text-xs text-marvel-yellow font-bold hover:text-white transition-colors"
                            >
                                <span>Image Banner Position</span>
                                {imageBannerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            
                            {imageBannerExpanded && (
                                <div className="space-y-3 mt-3">
                                    {/* Fold Horizontal */}
                                    <div>
                                        <label className="text-xs text-gray-400">Fold X: {displaySettings.imageBannerSettings?.foldOffsetX || 0}px</label>
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            value={displaySettings.imageBannerSettings?.foldOffsetX || 0}
                                            onChange={(e) => updateDisplaySetting('imageBannerSettings', {
                                                ...displaySettings.imageBannerSettings,
                                                foldOffsetX: parseInt(e.target.value),
                                            })}
                                            className="w-full"
                                        />
                                    </div>
                                    
                                    {/* Fold Vertical */}
                                    <div>
                                        <label className="text-xs text-gray-400">Fold Y: {displaySettings.imageBannerSettings?.foldOffsetY || 0}px</label>
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            value={displaySettings.imageBannerSettings?.foldOffsetY || 0}
                                            onChange={(e) => updateDisplaySetting('imageBannerSettings', {
                                                ...displaySettings.imageBannerSettings,
                                                foldOffsetY: parseInt(e.target.value),
                                            })}
                                            className="w-full"
                                        />
                                    </div>
                                    
                                    {/* Fold Rotation */}
                                    <div>
                                        <label className="text-xs text-gray-400">Fold Rotation: {displaySettings.imageBannerSettings?.foldRotation || 0.5}°</label>
                                        <input
                                            type="range"
                                            min="-5"
                                            max="5"
                                            step="0.5"
                                            value={displaySettings.imageBannerSettings?.foldRotation || 0.5}
                                            onChange={(e) => updateDisplaySetting('imageBannerSettings', {
                                                ...displaySettings.imageBannerSettings,
                                                foldRotation: parseFloat(e.target.value),
                                            })}
                                            className="w-full"
                                        />
                                    </div>
                                    
                                    {/* Banner Horizontal */}
                                    <div>
                                        <label className="text-xs text-gray-400">Banner X: {displaySettings.imageBannerSettings?.bannerOffsetX || 0}px</label>
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            value={displaySettings.imageBannerSettings?.bannerOffsetX || 0}
                                            onChange={(e) => updateDisplaySetting('imageBannerSettings', {
                                                ...displaySettings.imageBannerSettings,
                                                bannerOffsetX: parseInt(e.target.value),
                                            })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Background Toggle */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            checked={displaySettings.showBackground}
                            onChange={(e) => updateDisplaySetting('showBackground', e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">Show Background Image</span>
                    </label>
                    {displaySettings.showBackground && (
                        <div className="ml-7 space-y-3">
                            <p className="text-xs text-gray-400">
                                {displaySettings.customBackground ? 'Using custom background' : 'Using default Marvel Rivals background'}
                            </p>
                            <div className="flex gap-2">
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-marvel-metal border border-marvel-border rounded text-sm hover:border-marvel-yellow transition-colors cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Custom</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    updateDisplaySetting('customBackground', event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                                {displaySettings.customBackground && (
                                    <button
                                        onClick={() => updateDisplaySetting('customBackground', undefined)}
                                        className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 rounded text-sm text-red-400 hover:bg-red-600/30 transition-colors"
                                    >
                                        Use Default
                                    </button>
                                )}
                            </div>
                            
                            {/* Background Gallery */}
                            <details className="mt-3">
                                <summary className="text-xs text-marvel-yellow font-bold cursor-pointer hover:text-marvel-accent">
                                    Choose from gallery
                                </summary>
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 mt-2">
                                    {[
                                        '/backgrounds/img_gallery_card_horizontal_01.png',
                                        '/backgrounds/img_gallery_card_horizontal_02.png',
                                        '/backgrounds/img_gallery_card_horizontal_03.png',
                                        '/backgrounds/img_gallery_card_horizontal_04.png',
                                        '/backgrounds/img_gallery_card_horizontal_05.png',
                                        '/backgrounds/img_gallery_card_horizontal_06.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_01.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_02.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_03.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_04.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_05.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_06.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_07.png',
                                        '/backgrounds/img_gallerys1_card_horizontal_08.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_01.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_02.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_03.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_04.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_05.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_06.png',
                                        '/backgrounds/img_gallerys2_card_horizontal_07.png',
                                        '/backgrounds/img_gallerys2_magazine_01.png',
                                        '/backgrounds/img_gallerys3_card_horizontal_03.png',
                                        '/backgrounds/img_gallerys3_card_horizontal_04.png',
                                        '/backgrounds/img_gallerys3_card_horizontal_05.png',
                                        '/backgrounds/img_gallerys3_card_horizontal_06.png',
                                        '/backgrounds/img_gallerys3_magazine_02.png',
                                        '/backgrounds/img_gallerys4_card_horizontal_01.png',
                                        '/backgrounds/img_gallerys4_card_horizontal_03.png',
                                        '/backgrounds/img_gallerys4_card_horizontal_04.png',
                                        '/backgrounds/img_gallerys4_magazine_01.png',
                                        '/backgrounds/img_gallerys5_card_horizontal_01.png',
                                        '/backgrounds/img_gallerys5_card_horizontal_02.png',
                                        '/backgrounds/img_gallerys5_card_horizontal_03.png',
                                        '/backgrounds/Marvel_Rivals_Best_Settings_for.png',
                                        '/backgrounds/marvel-rivals-main-menu-screen.png',
                                        '/backgrounds/q80thme87oag1.jpg',
                                    ].map((bg) => (
                                        <button
                                            key={bg}
                                            onClick={() => updateDisplaySetting('customBackground', bg)}
                                            className={`relative aspect-video rounded overflow-hidden border-2 transition-all hover:border-marvel-yellow ${
                                                displaySettings.customBackground === bg 
                                                    ? 'border-marvel-yellow ring-2 ring-marvel-yellow/50' 
                                                    : 'border-marvel-border'
                                            }`}
                                        >
                                            <img 
                                                src={bg} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                {/* Content Vertical Offset */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Content Vertical Offset: {displaySettings.contentOffsetY || 0}px</label>
                    <input
                        type="range"
                        min="-100"
                        max="100"
                        value={displaySettings.contentOffsetY || 0}
                        onChange={(e) => updateDisplaySetting('contentOffsetY', parseInt(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Move content sections up (positive) or down (negative) to fit more text</p>
                </div>

                {/* Ability Spacing */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Ability Spacing: {displaySettings.abilitySpacing ?? 16}px</label>
                    <input
                        type="range"
                        min="0"
                        max="24"
                        value={displaySettings.abilitySpacing ?? 16}
                        onChange={(e) => updateDisplaySetting('abilitySpacing', parseInt(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Reduce spacing to fit more abilities on the page</p>
                </div>

                {/* Banner Color */}
                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">Banner Gradient Color</label>
                    <div className="flex items-center gap-3 mb-2">
                        <input
                            type="color"
                            value={heroData.bannerColor}
                            onChange={(e) => updateField('bannerColor', e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                            type="text"
                            value={heroData.bannerColor}
                            onChange={(e) => updateField('bannerColor', e.target.value)}
                            className="w-24 bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {BANNER_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => updateField('bannerColor', preset.color)}
                                className="w-6 h-6 rounded border-2 border-transparent hover:border-white transition-colors"
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Banner Fold Settings - Collapsible */}
                <div className="mb-2 p-3 bg-marvel-metal/50 rounded border border-marvel-border">
                    <button
                        onClick={() => setFoldExpanded(!foldExpanded)}
                        className="w-full flex items-center justify-between text-sm font-medium text-marvel-accent hover:text-white transition-colors"
                    >
                        <span>Banner Fold/Edge</span>
                        {foldExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {foldExpanded && (
                        <div className="space-y-3 mt-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    Start Y: {displaySettings.foldSettings?.startY ?? 70}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    value={displaySettings.foldSettings?.startY ?? 70}
                                    onChange={(e) => updateDisplaySetting('foldSettings', {
                                        ...displaySettings.foldSettings || getDefaultFoldSettings(),
                                        startY: Number(e.target.value)
                                    })}
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    End X: {displaySettings.foldSettings?.endX ?? 75}%
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={displaySettings.foldSettings?.endX ?? 75}
                                    onChange={(e) => updateDisplaySetting('foldSettings', {
                                        ...displaySettings.foldSettings || getDefaultFoldSettings(),
                                        endX: Number(e.target.value)
                                    })}
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    Thickness: {displaySettings.foldSettings?.thickness ?? 5}%
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={displaySettings.foldSettings?.thickness ?? 5}
                                    onChange={(e) => updateDisplaySetting('foldSettings', {
                                        ...displaySettings.foldSettings || getDefaultFoldSettings(),
                                        thickness: Number(e.target.value)
                                    })}
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    Brightness: {(displaySettings.foldSettings?.brightness ?? 1.3).toFixed(2)}x
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="150"
                                    value={(displaySettings.foldSettings?.brightness ?? 1.3) * 100}
                                    onChange={(e) => updateDisplaySetting('foldSettings', {
                                        ...displaySettings.foldSettings || getDefaultFoldSettings(),
                                        brightness: Number(e.target.value) / 100
                                    })}
                                    className="w-full"
                                />
                            </div>
                            
                            <button
                                onClick={() => updateDisplaySetting('foldSettings', getDefaultFoldSettings())}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Reset to default
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Basic Info */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-marvel-accent">Basic Information</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Hero Name</label>
                    <input
                        type="text"
                        value={heroData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full bg-marvel-dark border border-marvel-border rounded px-3 py-2 text-white focus:border-marvel-yellow focus:outline-none"
                        placeholder="Enter hero name"
                    />
                </div>

                {/* Hero Logo Upload */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Hero Logo (optional)</label>
                    <div className="flex items-center gap-3">
                        {heroData.heroLogo ? (
                            <div className="w-16 h-16 border border-marvel-border rounded bg-marvel-dark overflow-hidden">
                                <img src={heroData.heroLogo} alt="Hero Logo" className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 border border-marvel-border rounded bg-marvel-dark flex items-center justify-center">
                                <span className="text-xs text-gray-500">No logo</span>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-marvel-metal border border-marvel-border rounded text-sm hover:border-marvel-yellow transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span>Upload Logo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                updateField('heroLogo', event.target?.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                            {heroData.heroLogo && (
                                <button
                                    onClick={() => updateField('heroLogo', undefined)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Remove logo
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Appears behind hero in top-left of banner</p>
                    
                    {/* Logo Position Controls - Collapsible */}
                    {heroData.heroLogo && (
                        <details className="mt-3">
                            <summary className="text-xs text-marvel-yellow font-bold cursor-pointer hover:text-marvel-accent p-2 bg-marvel-dark rounded border border-marvel-border">
                                Logo Position
                            </summary>
                            <div className="space-y-3 p-3 bg-marvel-dark rounded-b border border-t-0 border-marvel-border">
                                <div>
                                    <label className="text-xs text-gray-400">X: {heroData.heroLogoSettings?.offsetX || 0}px</label>
                                    <input
                                        type="range"
                                        min="-100"
                                        max="100"
                                        value={heroData.heroLogoSettings?.offsetX || 0}
                                        onChange={(e) => updateField('heroLogoSettings', {
                                            ...heroData.heroLogoSettings,
                                            offsetX: parseInt(e.target.value),
                                            offsetY: heroData.heroLogoSettings?.offsetY || 0,
                                            scale: heroData.heroLogoSettings?.scale || 1,
                                        })}
                                        className="w-full"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-400">Y: {heroData.heroLogoSettings?.offsetY || 0}px</label>
                                    <input
                                        type="range"
                                        min="-100"
                                        max="100"
                                        value={heroData.heroLogoSettings?.offsetY || 0}
                                        onChange={(e) => updateField('heroLogoSettings', {
                                            ...heroData.heroLogoSettings,
                                            offsetX: heroData.heroLogoSettings?.offsetX || 0,
                                            offsetY: parseInt(e.target.value),
                                            scale: heroData.heroLogoSettings?.scale || 1,
                                        })}
                                        className="w-full"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-400">Scale: {heroData.heroLogoSettings?.scale || 1}x</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={heroData.heroLogoSettings?.scale || 1}
                                        onChange={(e) => updateField('heroLogoSettings', {
                                            ...heroData.heroLogoSettings,
                                            offsetX: heroData.heroLogoSettings?.offsetX || 0,
                                            offsetY: heroData.heroLogoSettings?.offsetY || 0,
                                            scale: parseFloat(e.target.value),
                                        })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </details>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                        value={heroData.role}
                        onChange={(e) => updateField('role', e.target.value as Role)}
                        className="w-full bg-marvel-dark border border-marvel-border rounded px-3 py-2 text-white focus:border-marvel-yellow focus:outline-none"
                    >
                        <option value="Strategist">Strategist</option>
                        <option value="Duelist">Duelist</option>
                        <option value="Vanguard">Vanguard</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Difficulty (1-5)</label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={heroData.difficulty}
                        onChange={(e) => updateField('difficulty', parseInt(e.target.value))}
                        className="w-full"
                    />
                    <div className="text-center text-marvel-yellow font-bold">{heroData.difficulty} Stars</div>
                </div>
            </div>

            {/* Hero Image Position - Collapsible */}
            <div className="mb-6 p-4 bg-marvel-dark rounded-lg border border-marvel-border">
                <button
                    onClick={() => setHeroImageExpanded(!heroImageExpanded)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-marvel-yellow" />
                        <h3 className="text-lg font-semibold text-marvel-accent">Hero Image Position</h3>
                    </div>
                    {heroImageExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                
                {heroImageExpanded && (
                <div className="space-y-3 mt-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Scale: {(heroData.portraitSettings?.scale || 1).toFixed(1)}x</label>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={heroData.portraitSettings?.scale || 1}
                            onChange={(e) => updateField('portraitSettings', { 
                                ...heroData.portraitSettings || getDefaultPortraitSettings(), 
                                scale: parseFloat(e.target.value) 
                            })}
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Horizontal: {heroData.portraitSettings?.offsetX || 0}%</label>
                        <input
                            type="range"
                            min="-50"
                            max="50"
                            value={heroData.portraitSettings?.offsetX || 0}
                            onChange={(e) => updateField('portraitSettings', { 
                                ...heroData.portraitSettings || getDefaultPortraitSettings(), 
                                offsetX: parseInt(e.target.value) 
                            })}
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Vertical: {heroData.portraitSettings?.offsetY || 0}%</label>
                        <input
                            type="range"
                            min="-50"
                            max="50"
                            value={heroData.portraitSettings?.offsetY || 0}
                            onChange={(e) => updateField('portraitSettings', { 
                                ...heroData.portraitSettings || getDefaultPortraitSettings(), 
                                offsetY: parseInt(e.target.value) 
                            })}
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Edge Fade: {heroData.portraitSettings?.fadeAmount ?? 50}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={heroData.portraitSettings?.fadeAmount ?? 50}
                            onChange={(e) => updateField('portraitSettings', { 
                                ...heroData.portraitSettings || getDefaultPortraitSettings(), 
                                fadeAmount: parseInt(e.target.value) 
                            })}
                            className="w-full"
                        />
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3 mt-3">
                        <label className="block text-xs text-gray-300 font-semibold mb-2">Image Crop</label>
                        
                        {heroData.portraitImage ? (
                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowCropEditor(true)}
                                    className="flex items-center gap-2 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm"
                                >
                                    <Crop className="w-4 h-4" />
                                    Open Crop Editor
                                </button>
                                
                                {heroData.portraitSettings?.crop && (
                                    heroData.portraitSettings.crop.top > 0 || 
                                    heroData.portraitSettings.crop.left > 0 || 
                                    heroData.portraitSettings.crop.right > 0 || 
                                    heroData.portraitSettings.crop.bottom > 0
                                ) && (
                                    <div className="text-xs text-gray-400">
                                        Crop: T{heroData.portraitSettings.crop.top.toFixed(0)}% L{heroData.portraitSettings.crop.left.toFixed(0)}% R{heroData.portraitSettings.crop.right.toFixed(0)}% B{heroData.portraitSettings.crop.bottom.toFixed(0)}%
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">Upload an image first to crop</p>
                        )}
                    </div>
                    
                    <button
                        onClick={() => updateField('portraitSettings', getDefaultPortraitSettings())}
                        className="text-xs text-gray-400 hover:text-white"
                    >
                        Reset to default
                    </button>
                </div>
                )}
            </div>

            {/* Hero Name/Difficulty Position - Collapsible */}
            <div className="mb-6 p-4 bg-marvel-dark rounded-lg border border-marvel-border">
                <button
                    onClick={() => setHeroNameExpanded(!heroNameExpanded)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-marvel-yellow" />
                        <h3 className="text-lg font-semibold text-marvel-accent">Hero Name Position</h3>
                    </div>
                    {heroNameExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                
                {heroNameExpanded && (
                <div className="space-y-3 mt-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Horizontal: {heroData.heroInfoSettings?.offsetX || 0}px</label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={heroData.heroInfoSettings?.offsetX || 0}
                            onChange={(e) => updateField('heroInfoSettings', { 
                                ...heroData.heroInfoSettings || getDefaultHeroInfoSettings(), 
                                offsetX: parseInt(e.target.value) 
                            })}
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Vertical: {heroData.heroInfoSettings?.offsetY || 0}px</label>
                        <input
                            type="range"
                            min="-200"
                            max="200"
                            value={heroData.heroInfoSettings?.offsetY || 0}
                            onChange={(e) => updateField('heroInfoSettings', { 
                                ...heroData.heroInfoSettings || getDefaultHeroInfoSettings(), 
                                offsetY: parseInt(e.target.value) 
                            })}
                            className="w-full"
                        />
                    </div>
                    
                    <button
                        onClick={() => updateField('heroInfoSettings', getDefaultHeroInfoSettings())}
                        className="text-xs text-gray-400 hover:text-white"
                    >
                        Reset to default
                    </button>
                </div>
                )}
            </div>

            {/* Attacks */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-marvel-accent">Attacks</h3>
                    <button onClick={addAttack} className="flex items-center gap-1 text-sm text-marvel-yellow hover:text-marvel-accent">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                {heroData.attacks.map((attack, index) => (
                    <div 
                        key={attack.id} 
                        className={`mb-4 p-3 bg-marvel-dark rounded transition-all ${
                            draggedItem?.type === 'attack' && dragOverIndex === index 
                                ? 'border-2 border-marvel-yellow border-dashed' 
                                : 'border-2 border-transparent'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart('attack', index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop('attack', index)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-marvel-yellow">Attack {index + 1}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <IconUpload icon={attack.icon} onUpload={(url) => updateAttack(attack.id, 'icon', url)} size="sm" />
                                {attack.icon && (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            value={attack.iconScale || 1}
                                            onChange={(e) => updateAttack(attack.id, 'iconScale', parseFloat(e.target.value))}
                                            className="w-16 h-4"
                                            title={`Scale: ${attack.iconScale || 1}x`}
                                        />
                                        <span className="text-[10px] text-gray-500 w-6">{attack.iconScale || 1}x</span>
                                    </div>
                                )}
                                {heroData.attacks.length > 1 && (
                                    <button onClick={() => removeAttack(attack.id)} className="text-red-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" value={attack.name} onChange={(e) => updateAttack(attack.id, 'name', e.target.value)} placeholder="Name" className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                            {displaySettings.controlScheme === 'PC' ? (
                                <input type="text" value={attack.hotkey} onChange={(e) => updateAttack(attack.id, 'hotkey', e.target.value)} placeholder={hotkeyLabel} className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                            ) : (
                                <ConsoleButtonSelect
                                    value={attack.hotkeyConsole || ''}
                                    onChange={(val) => updateAttack(attack.id, 'hotkeyConsole', val)}
                                    options={CONSOLE_ATTACK_OPTIONS}
                                    placeholder="Console Button"
                                />
                            )}
                        </div>
                        <ColoredTextarea value={attack.description} onChange={(val) => updateAttack(attack.id, 'description', val)} placeholder="Description" rows={2} />
                    </div>
                ))}
            </div>

            {/* Team-Up Abilities */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-marvel-accent">Team-Up Abilities</h3>
                    <button onClick={addTeamUp} className="flex items-center gap-1 text-sm text-marvel-yellow hover:text-marvel-accent">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                {heroData.teamUpAbilities.length === 0 && <p className="text-gray-500 text-sm italic">No team-up abilities added.</p>}

                {heroData.teamUpAbilities.map((teamUp, index) => (
                    <div 
                        key={teamUp.id} 
                        className={`mb-4 p-3 bg-marvel-dark rounded transition-all ${
                            draggedItem?.type === 'teamup' && dragOverIndex === index 
                                ? 'border-2 border-marvel-yellow border-dashed' 
                                : 'border-2 border-transparent'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart('teamup', index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop('teamup', index)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-marvel-yellow">Team-Up {index + 1}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <IconUpload icon={teamUp.icon} onUpload={(url) => updateTeamUp(teamUp.id, 'icon', url)} size="sm" />
                                {teamUp.icon && (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            value={teamUp.iconScale || 1}
                                            onChange={(e) => updateTeamUp(teamUp.id, 'iconScale', parseFloat(e.target.value))}
                                            className="w-16 h-4"
                                            title={`Scale: ${teamUp.iconScale || 1}x`}
                                        />
                                        <span className="text-[10px] text-gray-500 w-6">{teamUp.iconScale || 1}x</span>
                                    </div>
                                )}
                                <button onClick={() => removeTeamUp(teamUp.id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" value={teamUp.name} onChange={(e) => updateTeamUp(teamUp.id, 'name', e.target.value)} placeholder="Name" className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                            {!teamUp.isPassive && (
                                displaySettings.controlScheme === 'PC' ? (
                                    <input type="text" value={teamUp.hotkey} onChange={(e) => updateTeamUp(teamUp.id, 'hotkey', e.target.value)} placeholder={hotkeyLabel} className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                                ) : (
                                    <ConsoleButtonSelect
                                        value={teamUp.hotkeyConsole || 'D-Pad'}
                                        onChange={(val) => updateTeamUp(teamUp.id, 'hotkeyConsole', val)}
                                        placeholder="Console Button"
                                    />
                                )
                            )}
                        </div>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={teamUp.isPassive || false}
                                    onChange={() => toggleTeamUpPassive(teamUp.id)}
                                    className="w-4 h-4"
                                />
                                <span className="text-xs text-gray-400">Is Passive</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={teamUp.isAnchor !== false}
                                    onChange={() => updateTeamUp(teamUp.id, 'isAnchor', !teamUp.isAnchor)}
                                    className="w-4 h-4"
                                />
                                <span className="text-xs text-gray-400">Hero is Anchor</span>
                            </label>
                        </div>
                        <ColoredTextarea value={teamUp.description} onChange={(val) => updateTeamUp(teamUp.id, 'description', val)} placeholder="Description" rows={2} />
                        
                        {/* Team-Up Heroes Section */}
                        <details className="mt-2 pt-2 border-t border-marvel-border group">
                            <summary className="text-xs text-marvel-yellow font-bold cursor-pointer hover:text-marvel-accent flex items-center gap-2 list-none">
                                <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                                Team-Up Heroes
                                <span className="text-gray-500 font-normal">
                                    ({teamUp.isAnchor === false && teamUp.anchorIcon ? '1 anchor' : ''}{teamUp.isAnchor === false && teamUp.anchorIcon && teamUp.partnerIcons?.length ? ', ' : ''}{teamUp.partnerIcons?.length ? `${teamUp.partnerIcons.length} partner${teamUp.partnerIcons.length > 1 ? 's' : ''}` : ''})
                                </span>
                            </summary>
                            <div className="mt-2 space-y-3">
                                {/* Anchor Selection (when hero is not anchor) */}
                                {teamUp.isAnchor === false && (
                                    <div className="p-2 bg-marvel-metal rounded">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-yellow-400 font-bold">ANCHOR:</span>
                                            {teamUp.anchorIcon ? (
                                                <div className="relative group">
                                                    <div className="w-8 h-8 rounded overflow-hidden border-2 border-yellow-500">
                                                        <img src={teamUp.anchorIcon} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <button 
                                                        onClick={() => updateTeamUp(teamUp.id, 'anchorIcon', undefined)}
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">Click a hero below to set</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-8 gap-1 max-h-20 overflow-y-auto">
                                            {HERO_ICONS.map((hero) => (
                                                <button
                                                    key={hero.path}
                                                    onClick={() => updateTeamUp(teamUp.id, 'anchorIcon', hero.path)}
                                                    className={`w-6 h-6 rounded overflow-hidden border transition-all hover:border-yellow-500 ${
                                                        teamUp.anchorIcon === hero.path ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-transparent'
                                                    }`}
                                                    title={hero.name}
                                                >
                                                    <img src={hero.path} alt={hero.name} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Partners Selection */}
                                <div className="p-2 bg-marvel-metal rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-300 font-bold">PARTNERS:</span>
                                        {(teamUp.partnerIcons || []).map((icon, iconIdx) => (
                                            <div key={iconIdx} className="relative group">
                                                <div className="w-8 h-8 rounded overflow-hidden border border-marvel-border">
                                                    <img src={icon} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <button 
                                                    onClick={() => removePartnerIcon(teamUp.id, iconIdx)}
                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-8 h-8 border border-dashed border-gray-600 rounded cursor-pointer flex items-center justify-center hover:border-marvel-yellow transition-colors" title="Upload custom">
                                            <Upload className="w-3 h-3 text-gray-500" />
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            addPartnerIcon(teamUp.id, event.target?.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-1">Click to add partner:</p>
                                    <div className="grid grid-cols-8 gap-1 max-h-20 overflow-y-auto">
                                        {HERO_ICONS.map((hero) => (
                                            <button
                                                key={hero.path}
                                                onClick={() => addPartnerIcon(teamUp.id, hero.path)}
                                                className={`w-6 h-6 rounded overflow-hidden border transition-all hover:border-green-500 ${
                                                    (teamUp.partnerIcons || []).includes(hero.path) ? 'border-green-500 ring-1 ring-green-500' : 'border-transparent'
                                                }`}
                                                title={`Add ${hero.name}`}
                                            >
                                                <img src={hero.path} alt={hero.name} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                ))}
            </div>

            {/* Ultimate */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-marvel-accent">Ultimate (Top of Abilities)</h3>
                <div className="p-3 bg-marvel-dark rounded border border-marvel-yellow/30">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-marvel-yellow">Ultimate</h4>
                        <div className="flex items-center gap-2">
                            <IconUpload icon={heroData.ultimate.icon} onUpload={(url) => updateUltimate('icon', url)} size="sm" />
                            {heroData.ultimate.icon && (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={heroData.ultimate.iconScale || 1}
                                        onChange={(e) => updateUltimate('iconScale', parseFloat(e.target.value))}
                                        className="w-16 h-4"
                                        title={`Scale: ${heroData.ultimate.iconScale || 1}x`}
                                    />
                                    <span className="text-[10px] text-gray-500 w-6">{heroData.ultimate.iconScale || 1}x</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="text" value={heroData.ultimate.name} onChange={(e) => updateUltimate('name', e.target.value)} placeholder="Name" className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                        {displaySettings.controlScheme === 'PC' ? (
                            <input type="text" value={heroData.ultimate.hotkey} onChange={(e) => updateUltimate('hotkey', e.target.value)} placeholder={hotkeyLabel} className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                        ) : (
                            <ConsoleButtonSelect
                                value={heroData.ultimate.hotkeyConsole || ''}
                                onChange={(val) => updateUltimate('hotkeyConsole', val)}
                                placeholder="Console Button"
                            />
                        )}
                    </div>
                    <ColoredTextarea value={heroData.ultimate.description} onChange={(val) => updateUltimate('description', val)} placeholder="Description" rows={3} />
                </div>
            </div>

            {/* Abilities */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-marvel-accent">Abilities</h3>
                    <button onClick={addAbility} className="flex items-center gap-1 text-sm text-marvel-yellow hover:text-marvel-accent">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                {heroData.abilities.map((ability, index) => (
                    <div 
                        key={ability.id} 
                        className={`mb-4 p-3 bg-marvel-dark rounded transition-all ${
                            draggedItem?.type === 'ability' && dragOverIndex === index 
                                ? 'border-2 border-marvel-yellow border-dashed' 
                                : 'border-2 border-transparent'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart('ability', index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop('ability', index)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-marvel-yellow">Ability {index + 1}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <IconUpload icon={ability.icon} onUpload={(url) => updateAbility(ability.id, 'icon', url)} size="sm" />
                                {ability.icon && (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            value={ability.iconScale || 1}
                                            onChange={(e) => updateAbility(ability.id, 'iconScale', parseFloat(e.target.value))}
                                            className="w-16 h-4"
                                            title={`Scale: ${ability.iconScale || 1}x`}
                                        />
                                        <span className="text-[10px] text-gray-500 w-6">{ability.iconScale || 1}x</span>
                                    </div>
                                )}
                                {heroData.abilities.length > 1 && (
                                    <button onClick={() => removeAbility(ability.id)} className="text-red-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" value={ability.name} onChange={(e) => updateAbility(ability.id, 'name', e.target.value)} placeholder="Name" className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                            {displaySettings.controlScheme === 'PC' ? (
                                <input type="text" value={ability.hotkey} onChange={(e) => updateAbility(ability.id, 'hotkey', e.target.value)} placeholder={hotkeyLabel} className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white" />
                            ) : (
                                <ConsoleButtonSelect
                                    value={ability.hotkeyConsole || ''}
                                    onChange={(val) => updateAbility(ability.id, 'hotkeyConsole', val)}
                                    placeholder="Console Button"
                                />
                            )}
                        </div>
                        <ColoredTextarea value={ability.description} onChange={(val) => updateAbility(ability.id, 'description', val)} placeholder="Description" rows={2} />
                    </div>
                ))}
            </div>

            {/* Passives */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-marvel-accent">Passives (Bottom of Abilities)</h3>
                    <button onClick={addPassive} className="flex items-center gap-1 text-sm text-marvel-yellow hover:text-marvel-accent">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                {heroData.passives.length === 0 && <p className="text-gray-500 text-sm italic">No passives added.</p>}

                {heroData.passives.map((passive, index) => (
                    <div 
                        key={passive.id} 
                        className={`mb-4 p-3 bg-marvel-dark rounded transition-all ${
                            draggedItem?.type === 'passive' && dragOverIndex === index 
                                ? 'border-2 border-marvel-yellow border-dashed' 
                                : 'border-2 border-transparent'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart('passive', index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop('passive', index)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-marvel-yellow">Passive {index + 1}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <IconUpload icon={passive.icon} onUpload={(url) => updatePassive(passive.id, 'icon', url)} size="sm" />
                                {passive.icon && (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            value={passive.iconScale || 1}
                                            onChange={(e) => updatePassive(passive.id, 'iconScale', parseFloat(e.target.value))}
                                            className="w-16 h-4"
                                            title={`Scale: ${passive.iconScale || 1}x`}
                                        />
                                        <span className="text-[10px] text-gray-500 w-6">{passive.iconScale || 1}x</span>
                                    </div>
                                )}
                                <button onClick={() => removePassive(passive.id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <input type="text" value={passive.name} onChange={(e) => updatePassive(passive.id, 'name', e.target.value)} placeholder="Name" className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white mb-2" />
                        <ColoredTextarea value={passive.description} onChange={(val) => updatePassive(passive.id, 'description', val)} placeholder="Description" rows={2} />
                    </div>
                ))}
            </div>

            {/* Team-Up Anchor */}
            <div className="mb-6 p-4 bg-marvel-dark rounded-lg border border-marvel-border">
                <h3 className="text-lg font-semibold mb-3 text-marvel-accent">Team-Up Anchor</h3>
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={heroData.teamUpAnchor?.enabled || false}
                        onChange={(e) => updateTeamUpAnchor(e.target.checked)}
                        className="w-5 h-5 rounded"
                    />
                    <span className="text-sm">Enable Team-Up Anchor Display</span>
                </label>
                {heroData.teamUpAnchor?.enabled && (
                    <input
                        type="text"
                        value={heroData.teamUpAnchor.bonusText}
                        onChange={(e) => updateTeamUpAnchor(true, e.target.value)}
                        placeholder="e.g., +5% Healing Bonus"
                        className="w-full bg-marvel-metal border border-marvel-border rounded px-3 py-2 text-white text-sm"
                    />
                )}
            </div>

            {/* Additional Pages */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-marvel-accent">Additional Pages</h3>
                    <button onClick={addPage} className="flex items-center gap-1 text-sm text-marvel-yellow hover:text-marvel-accent">
                        <Plus className="w-4 h-4" /> Add Page
                    </button>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">Add extra pages like Gambit's card forms. Users can scroll between pages.</p>

                {(!heroData.additionalPages || heroData.additionalPages.length === 0) && (
                    <p className="text-gray-500 text-sm italic">No additional pages. Content fits on main page.</p>
                )}

                {heroData.additionalPages?.map((page, pageIndex) => (
                    <div key={page.id} className="mb-4 p-3 bg-marvel-dark rounded border border-marvel-border">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-marvel-yellow">Page {pageIndex + 2}</h4>
                            <div className="flex items-center gap-2">
                                <IconUpload icon={page.icon} onUpload={(url) => updatePage(page.id, 'icon', url)} size="sm" />
                                <button onClick={() => removePage(page.id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <input
                            type="text"
                            value={page.title}
                            onChange={(e) => updatePage(page.id, 'title', e.target.value)}
                            placeholder="Page Title (e.g., HEALING HEARTS)"
                            className="w-full bg-marvel-metal border border-marvel-border rounded px-2 py-1 text-sm text-white mb-3"
                        />

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Abilities on this page:</span>
                            <button onClick={() => addAbilityToPage(page.id)} className="flex items-center gap-1 text-xs text-marvel-yellow hover:text-marvel-accent">
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        {page.abilities.map((ability, abilityIndex) => (
                            <div key={ability.id} className="mb-2 p-2 bg-marvel-metal rounded">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-400">Ability {abilityIndex + 1}</span>
                                    <div className="flex items-center gap-1">
                                        <IconUpload icon={ability.icon} onUpload={(url) => updatePageAbility(page.id, ability.id, 'icon', url)} size="sm" />
                                        {page.abilities.length > 1 && (
                                            <button onClick={() => removeAbilityFromPage(page.id, ability.id)} className="text-red-500 hover:text-red-400">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input type="text" value={ability.name} onChange={(e) => updatePageAbility(page.id, ability.id, 'name', e.target.value)} placeholder="Name" className="w-full bg-marvel-dark border border-marvel-border rounded px-2 py-1 text-xs text-white mb-1" />
                                <div className="flex gap-2 mb-1">
                                    <input type="text" value={ability.hotkey} onChange={(e) => updatePageAbility(page.id, ability.id, 'hotkey', e.target.value)} placeholder="Hotkey" className="w-20 bg-marvel-dark border border-marvel-border rounded px-2 py-1 text-xs text-white" />
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={ability.isPassive || false}
                                            onChange={(e) => updatePageAbility(page.id, ability.id, 'isPassive', e.target.checked)}
                                            className="w-3 h-3"
                                        />
                                        <span className="text-[10px] text-gray-400">Passive</span>
                                    </label>
                                </div>
                                <ColoredTextarea value={ability.description} onChange={(val) => updatePageAbility(page.id, ability.id, 'description', val)} placeholder="Description" rows={2} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Crop Editor Modal */}
            {showCropEditor && heroData.portraitImage && (
                <ImageCropEditor
                    imageUrl={heroData.portraitImage}
                    initialCrop={heroData.portraitSettings?.crop || getDefaultCropBounds()}
                    onApply={handleCropApply}
                    onCancel={() => setShowCropEditor(false)}
                />
            )}
        </div>
    );
};

export default FormEditor;

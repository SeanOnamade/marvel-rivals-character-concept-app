import React, { useState, useEffect, useRef } from 'react';
import { HeroData, DisplaySettings, ContentPage } from '../types';
import HeroPortrait from './HeroPortrait';
import DifficultyStars from './DifficultyStars';
import { parseColoredText } from '../utils';

interface AbilityPageRendererProps {
    heroData: HeroData;
    displaySettings: DisplaySettings;
    onImageUpload: (file: File) => void;
    onPageChange?: (page: number) => void;
}

// Helper function to convert hex color to HSL and calculate color adjustments
// The banner images are base blue ~225° hue
const calculateColorAdjustments = (hexColor: string): { hueRotation: number; saturation: number; brightness: number } => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    const targetHue = h * 360;
    const baseHue = 225; // Blue hue of the original banner images
    
    // Calculate hue rotation
    let hueRotation = targetHue - baseHue;
    
    // For reds (hue near 0 or 360), we need special handling
    // Red gets shifted toward orange by default, so we push it back
    if (targetHue < 30 || targetHue > 330) {
        // This is a red - shift more toward magenta to counteract orange shift
        hueRotation -= 15;
    }
    
    // Higher saturation to counteract the washed-out effect of hue-rotate
    const saturation = Math.max(1.5, s * 3);
    // Reduce brightness slightly to deepen the color
    const brightness = 0.75 + (l * 0.2);
    
    return { hueRotation, saturation, brightness };
};

// Role icon paths
const getRoleIconPath = (role: string): string => {
    return `/role-icons/${role}.png`;
};

// Component to render text with color highlights
interface ColoredTextProps {
    text: string;
    className?: string;
}

const ColoredText: React.FC<ColoredTextProps> = ({ text, className = '' }) => {
    const segments = parseColoredText(text);
    
    return (
        <span className={className}>
            {segments.map((segment, idx) => (
                segment.color ? (
                    <span key={idx} style={{ color: segment.color }}>{segment.text}</span>
                ) : (
                    <span key={idx}>{segment.text}</span>
                )
            ))}
        </span>
    );
};

// Icon props shared by all icon types
interface IconProps {
    icon?: string;
    iconScale?: number; // Scale for the icon image (0.5 to 2, default 1)
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

// Diamond-shaped icon for abilities (rotated 45 degrees)
const AbilityIcon: React.FC<IconProps> = ({ icon, iconScale = 1, size = 'md', glow = false }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const glowStyle = glow ? { boxShadow: '0 0 20px rgba(255,200,0,0.6)' } : {};
    const baseScale = 1.4 * iconScale;

    return (
        <div 
            className={`${sizeClasses[size]} bg-[#1a1a1a] border border-yellow-500/60 flex-shrink-0 overflow-hidden rotate-45`}
            style={glowStyle}
        >
            {icon ? (
                <div className="w-full h-full -rotate-45 flex items-center justify-center">
                    <img 
                        src={icon} 
                        alt="" 
                        className="object-cover"
                        style={{ 
                            filter: 'brightness(0) invert(1)', 
                            width: `${baseScale * 100}%`,
                            height: `${baseScale * 100}%`
                        }}
                    />
                </div>
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-500/30 to-transparent" />
            )}
        </div>
    );
};

// Rectangle-shaped icon for attacks (no rotation) - wider than abilities
const AttackIcon: React.FC<IconProps> = ({ icon, iconScale = 1, size = 'md', glow = false }) => {
    const sizeClasses = {
        sm: 'w-20 h-8',
        md: 'w-24 h-10',
        lg: 'w-28 h-12'
    };

    const glowStyle = glow ? { boxShadow: '0 0 20px rgba(255,200,0,0.6)' } : {};

    return (
        <div 
            className={`${sizeClasses[size]} bg-[#1a1a1a] border border-yellow-500/60 flex-shrink-0 overflow-hidden flex items-center justify-center`}
            style={glowStyle}
        >
            {icon ? (
                <img 
                    src={icon} 
                    alt="" 
                    className="object-cover"
                    style={{ 
                        filter: 'brightness(0) invert(1)',
                        width: `${iconScale * 100}%`,
                        height: `${iconScale * 100}%`
                    }}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-500/30 to-transparent" />
            )}
        </div>
    );
};

// Parallelogram-shaped icon for team-ups (skewed)
const TeamUpIcon: React.FC<IconProps> = ({ icon, iconScale = 1, size = 'md', glow = false }) => {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-14 h-14'
    };

    const glowStyle = glow ? { boxShadow: '0 0 20px rgba(255,200,0,0.6)' } : {};

    return (
        <div 
            className={`${sizeClasses[size]} bg-[#1a1a1a] border border-yellow-500/60 flex-shrink-0 overflow-hidden`}
            style={{ ...glowStyle, transform: 'skewX(-10deg)' }}
        >
            {icon ? (
                <div className="w-full h-full flex items-center justify-center" style={{ transform: 'skewX(10deg)' }}>
                    <img 
                        src={icon} 
                        alt="" 
                        className="object-cover"
                        style={{ 
                            filter: 'brightness(0) invert(1)',
                            width: `${iconScale * 100}%`,
                            height: `${iconScale * 100}%`
                        }} 
                    />
                </div>
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-500/30 to-transparent" />
            )}
        </div>
    );
};

// Hotkey label - styled with parallelogram background, or shows mouse icons for LMB/RMB
interface HotkeyLabelProps {
    hotkey: string;
    glow?: boolean;
}

const HotkeyLabel: React.FC<HotkeyLabelProps> = ({ hotkey, glow = false }) => {
    const upperHotkey = hotkey.toUpperCase();
    const isPassive = upperHotkey === 'PASSIVE';
    const isLMB = upperHotkey === 'LMB';
    const isRMB = upperHotkey === 'RMB';
    
    // Show mouse button icons instead of text for LMB/RMB
    if (isLMB || isRMB) {
        return (
            <div className="mt-1.5 flex justify-center">
                <img 
                    src={isLMB ? "/ui/lmb-icon.png" : "/ui/rmb-icon.png"}
                    alt={isLMB ? "Left Mouse Button" : "Right Mouse Button"}
                    className="h-6 w-auto object-contain"
                    style={{ 
                        filter: glow ? 'drop-shadow(0 0 6px rgba(255,200,0,0.8))' : 'none',
                    }}
                />
            </div>
        );
    }
    
    return (
        <div className="mt-1.5 relative flex justify-center">
            {/* Parallelogram background */}
            <div 
                className="absolute inset-0 bg-yellow-500"
                style={{ 
                    transform: 'skewX(-10deg)',
                    boxShadow: glow ? '0 0 12px rgba(255,200,0,0.8)' : 'none',
                }}
            />
            {/* Text */}
            <span 
                className={`relative z-10 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide ${isPassive ? 'text-yellow-900' : 'text-black'}`}
            >
                {hotkey}
            </span>
        </div>
    );
};

// Crop bounds interface
interface CropBounds {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

// Small partner icon (for team-ups) with optional cropping
interface PartnerIconProps {
    icon?: string;
    crop?: CropBounds;
}

const PartnerIcon: React.FC<PartnerIconProps> = ({ icon, crop }) => {
    // Check if we have meaningful crop values
    const hasCrop = crop && (crop.top > 0 || crop.left > 0 || crop.right > 0 || crop.bottom > 0);
    
    // Calculate crop styles similar to HeroPortrait
    let cropWrapperStyle: React.CSSProperties | undefined;
    let croppedImageStyle: React.CSSProperties | undefined;
    
    if (hasCrop && crop) {
        const visibleWidth = 100 - crop.left - crop.right;
        const visibleHeight = 100 - crop.top - crop.bottom;
        const scale = Math.max(100 / visibleWidth, 100 / visibleHeight);
        const centerX = crop.left + visibleWidth / 2;
        const centerY = crop.top + visibleHeight / 2;
        
        cropWrapperStyle = {
            position: 'absolute',
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            left: `${50 - centerX * scale}%`,
            top: `${50 - centerY * scale}%`,
        };
        
        croppedImageStyle = {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
        };
    }

    return (
        <div className="w-8 h-8 rounded-sm overflow-hidden border border-gray-600 bg-[#1a1a1a] relative">
            {icon ? (
                hasCrop && cropWrapperStyle && croppedImageStyle ? (
                    <div style={cropWrapperStyle}>
                        <img src={icon} alt="" style={croppedImageStyle} />
                    </div>
                ) : (
                    <img src={icon} alt="" className="w-full h-full object-cover" />
                )
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-600/30 to-transparent" />
            )}
        </div>
    );
};

// Page indicator icons
interface PageIndicatorProps {
    pages: ContentPage[];
    currentPage: number;
    onPageChange: (page: number) => void;
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ pages, currentPage, onPageChange }) => {
    if (pages.length === 0) return null;
    
    return (
        <div className="flex items-center gap-1 mb-3">
            <button
                onClick={() => onPageChange(0)}
                className={`w-8 h-8 border ${currentPage === 0 ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-600 bg-black/40'} flex items-center justify-center`}
            >
                <span className="text-xs text-white">1</span>
            </button>
            
            {pages.map((page, idx) => (
                <button
                    key={page.id}
                    onClick={() => onPageChange(idx + 1)}
                    className={`w-8 h-8 border ${currentPage === idx + 1 ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-600 bg-black/40'} flex items-center justify-center overflow-hidden`}
                >
                    {page.icon ? (
                        <img src={page.icon} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs text-white">{idx + 2}</span>
                    )}
                </button>
            ))}
            
            <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-gray-400">Scroll</span>
            </div>
        </div>
    );
};

const AbilityPageRenderer = React.forwardRef<HTMLDivElement, AbilityPageRendererProps>(
    ({ heroData, displaySettings, onImageUpload, onPageChange }, ref) => {
        const isPC = displaySettings.controlScheme === 'PC';
        const currentPage = displaySettings.currentPage || 0;

        // Track image loading state
        const [isImageLoading, setIsImageLoading] = useState(false);
        const previousImageRef = useRef<string | undefined>(heroData.portraitImage);
        const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        // Detect when portrait image changes and show loading overlay
        useEffect(() => {
            const currentImage = heroData.portraitImage;
            const previousImage = previousImageRef.current;

            // Only show loading if switching between different images (not initial load or clearing)
            if (currentImage && previousImage && currentImage !== previousImage) {
                setIsImageLoading(true);

                // Preload the new image
                const img = new Image();
                img.onload = () => {
                    // Small delay to ensure smooth transition
                    loadingTimeoutRef.current = setTimeout(() => {
                        setIsImageLoading(false);
                    }, 100);
                };
                img.onerror = () => {
                    setIsImageLoading(false);
                };
                img.src = currentImage;
            }

            previousImageRef.current = currentImage;

            return () => {
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current);
                }
            };
        }, [heroData.portraitImage]);

        const getHotkey = (pcKey: string, consoleKey?: string) => {
            return isPC ? pcKey : (consoleKey || pcKey);
        };

        const handlePageChange = (page: number) => {
            onPageChange?.(page);
        };

        // Render main page content
        const renderMainPage = () => (
            <>
                {/* LEFT CONTENT COLUMN - Attacks & Team-Up Abilities */}
                <div className="w-1/2 pr-8">
                    {/* ATTACKS Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-white">ATTACKS</h2>
                            <div className="flex-1 h-px bg-gray-600"></div>
                        </div>

                        <div className="flex flex-col" style={{ gap: `${displaySettings.abilitySpacing ?? 16}px` }}>
                            {heroData.attacks.map((attack) => (
                                <div key={attack.id} className="flex gap-4 items-start">
                                    <div className="flex flex-col items-center">
                                        <AttackIcon icon={attack.icon} iconScale={attack.iconScale} size="md" />
                                        <HotkeyLabel hotkey={getHotkey(attack.hotkey, attack.hotkeyConsole)} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h4 className="text-base font-bold uppercase tracking-wide text-white mb-1">
                                            {attack.name}
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            <ColoredText text={attack.description} />
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TEAM-UP ABILITIES Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-white whitespace-nowrap">TEAM-UP ABILITIES</h2>
                            <div className="flex-1 h-px bg-gray-600"></div>
                        </div>

                        {heroData.teamUpAbilities.length === 0 ? (
                            <p className="text-gray-600 text-sm italic">No team-up abilities</p>
                        ) : (
                            <div className="flex flex-col" style={{ gap: `${displaySettings.abilitySpacing ?? 16}px` }}>
                                {heroData.teamUpAbilities.map((teamUp) => (
                                    <div key={teamUp.id} className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center">
                                            <TeamUpIcon icon={teamUp.icon} iconScale={teamUp.iconScale} size="md" />
                                            {teamUp.isPassive ? (
                                                <HotkeyLabel hotkey="PASSIVE" />
                                            ) : (
                                                <HotkeyLabel hotkey={getHotkey(teamUp.hotkey, teamUp.hotkeyConsole)} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h4 className="text-base font-bold uppercase tracking-wide text-white mb-1">
                                                {teamUp.name}
                                            </h4>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                <ColoredText text={teamUp.description} />
                                            </p>
                                            {/* Team-up hero icons with divider */}
                                            <div className="flex gap-1 mt-2 items-center">
                                                {/* Hero image (anchor position or secondary) */}
                                                {teamUp.isAnchor !== false ? (
                                                    <>
                                                        {/* Hero is anchor - show first */}
                                                        {/* Use custom character image if set, otherwise use hero portrait with cropping */}
                                                        <PartnerIcon 
                                                            icon={teamUp.characterImageUseCustom && teamUp.characterImage 
                                                                ? teamUp.characterImage 
                                                                : heroData.portraitImage
                                                            } 
                                                            crop={teamUp.characterImageUseCustom && teamUp.characterImage
                                                                ? teamUp.characterImageCrop
                                                                : (teamUp.characterImageCrop || heroData.portraitSettings?.crop)
                                                            }
                                                        />
                                                        {/* Divider */}
                                                        {teamUp.partnerIcons && teamUp.partnerIcons.length > 0 && (
                                                            <div className="w-px h-6 bg-gray-500 mx-1"></div>
                                                        )}
                                                        {/* Partner icons */}
                                                        {teamUp.partnerIcons?.map((icon, idx) => (
                                                            <PartnerIcon key={idx} icon={icon} />
                                                        ))}
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Hero is secondary - show anchor icon first, then divider, then hero (cropped), then partners */}
                                                        {teamUp.anchorIcon && (
                                                            <>
                                                                <PartnerIcon icon={teamUp.anchorIcon} />
                                                                <div className="w-px h-6 bg-gray-500 mx-1"></div>
                                                            </>
                                                        )}
                                                        {/* Hero's character image (cropped or custom) */}
                                                        <PartnerIcon 
                                                            icon={teamUp.characterImageUseCustom && teamUp.characterImage 
                                                                ? teamUp.characterImage 
                                                                : heroData.portraitImage
                                                            } 
                                                            crop={teamUp.characterImageUseCustom && teamUp.characterImage
                                                                ? teamUp.characterImageCrop
                                                                : (teamUp.characterImageCrop || heroData.portraitSettings?.crop)
                                                            }
                                                        />
                                                        {/* Other partner icons */}
                                                        {teamUp.partnerIcons?.map((icon, idx) => (
                                                            <PartnerIcon key={idx} icon={icon} />
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT CONTENT COLUMN - Abilities */}
                <div className="w-1/2 pl-8">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wider text-white">ABILITIES</h2>
                        <div className="flex-1 h-px bg-gray-600"></div>
                    </div>

                    <div className="flex flex-col" style={{ gap: `${displaySettings.abilitySpacing ?? 16}px` }}>
                        {/* ULTIMATE */}
                        <div className="flex gap-4 items-start">
                            <div className="flex flex-col items-center w-14 flex-shrink-0 overflow-visible">
                                <div className="relative flex items-center justify-center overflow-visible">
                                    <div className="absolute inset-0 bg-yellow-500/30 blur-lg rounded-full transform scale-150" />
                                    {/* Diamond shape with glow */}
                                    <div 
                                        className="w-10 h-10 bg-[#1a1a1a] border border-yellow-500/60 flex-shrink-0 overflow-hidden rotate-45 flex items-center justify-center"
                                        style={{ boxShadow: '0 0 20px rgba(255,200,0,0.6), inset 0 0 15px rgba(255,200,0,0.4)' }}
                                    >
                                        {/* Custom icon if provided (made white) */}
                                        {heroData.ultimate.icon && (
                                            <div className="-rotate-45 flex items-center justify-center w-full h-full">
                                                <img 
                                                    src={heroData.ultimate.icon}
                                                    alt="" 
                                                    className="object-contain"
                                                    style={{ 
                                                        filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255,200,0,0.6))',
                                                        width: `${(heroData.ultimate.iconScale || 1) * 140}%`,
                                                        height: `${(heroData.ultimate.iconScale || 1) * 140}%`
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* Lightning icon - overlapping the diamond */}
                                    {displaySettings.showUltimateLightning === true && (
                                        <img 
                                            src="/ui/ultimate-icon.png"
                                            alt="" 
                                            className="absolute w-14 h-14 object-contain pointer-events-none"
                                            style={{ 
                                                transform: 'scale(2) translateX(-2px) translateY(-2px)',
                                                opacity: 0.7,
                                                filter: 'hue-rotate(-10deg) saturate(1.2) drop-shadow(0 0 4px rgba(255,200,0,0.6))' 
                                            }}
                                        />
                                    )}
                                </div>
                                <HotkeyLabel hotkey={getHotkey(heroData.ultimate.hotkey, heroData.ultimate.hotkeyConsole)} glow />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h4 className="text-lg font-bold uppercase tracking-wide text-yellow-400 mb-1">
                                    {heroData.ultimate.name}
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    <ColoredText text={heroData.ultimate.description} />
                                </p>
                            </div>
                        </div>

                        {/* Regular Abilities */}
                        {heroData.abilities.map((ability) => (
                            <div key={ability.id} className="flex gap-4 items-start">
                                <div className="flex flex-col items-center w-14 flex-shrink-0">
                                    <AbilityIcon icon={ability.icon} iconScale={ability.iconScale} size="md" />
                                    <HotkeyLabel hotkey={getHotkey(ability.hotkey, ability.hotkeyConsole)} />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h4 className="text-base font-bold uppercase tracking-wide text-white mb-1">
                                        {ability.name}
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        <ColoredText text={ability.description} />
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Divider before passives */}
                        {heroData.passives.length > 0 && (
                            <div className="border-t border-gray-600" style={{ marginTop: `${(displaySettings.abilitySpacing ?? 16) / 2}px`, marginBottom: `${(displaySettings.abilitySpacing ?? 16) / 2}px` }}></div>
                        )}

                        {/* Passives */}
                        {heroData.passives.map((passive) => (
                            <div key={passive.id} className="flex gap-4 items-start">
                                <div className="flex flex-col items-center w-14 flex-shrink-0">
                                    <AbilityIcon icon={passive.icon} iconScale={passive.iconScale} size="md" />
                                    <HotkeyLabel hotkey="PASSIVE" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h4 className="text-base font-bold uppercase tracking-wide text-white mb-1">
                                        {passive.name}
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        <ColoredText text={passive.description} />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );

        // Render additional page content
        const renderAdditionalPage = (page: ContentPage) => (
            <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-white">{page.title}</h2>
                    <div className="flex-1 h-px bg-gray-600"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    {page.abilities.map((ability) => (
                        <div key={ability.id} className="flex gap-4 items-start">
                            <div className="flex flex-col items-center">
                                <AbilityIcon icon={ability.icon} iconScale={ability.iconScale} size="md" />
                                {ability.isPassive ? (
                                    <HotkeyLabel hotkey="PASSIVE" />
                                ) : (
                                    <HotkeyLabel hotkey={getHotkey(ability.hotkey, ability.hotkeyConsole)} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pt-2">
                                <h4 className="text-sm font-bold uppercase tracking-wide text-white mb-1">
                                    {ability.name}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <ColoredText text={ability.description} />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        // Background image source
        const backgroundImage = displaySettings.customBackground || '/backgrounds/q80thme87oag1.jpg';

        return (
            <div 
                ref={ref} 
                className="relative bg-[#0a0a0a] overflow-hidden"
                style={{ 
                    fontFamily: "'Matthan Sans', 'Rajdhani', sans-serif",
                    width: '1280px',
                    height: '720px',
                }}
            >
                {/* Background Image Layer - behind everything */}
                {displaySettings.showBackground && (
                    <div 
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(3px)',
                            transform: `scale(1.02)${displaySettings.flipBackgroundHorizontally ? ' scaleX(-1)' : ''}`, // Prevent blur edge artifacts, optional flip
                        }}
                    />
                )}
                
                {/* Dark overlay for readability when background is shown */}
                {displaySettings.showBackground && (
                    <div 
                        className="absolute inset-0 z-0 bg-black/40"
                    />
                )}

                {/* Loading overlay - shown when switching between presets/templates */}
                {isImageLoading && (
                    <div className="no-export absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Banner - conditionally image-based or CSS-based */}
                {displaySettings.useImageBanner !== false ? (
                    // Image-based banner with hue rotation and transparency fade
                    (() => {
                        const colorAdj = calculateColorAdjustments(heroData.bannerColor);
                        const fold = displaySettings.foldSettings || { startY: 31, endX: 72, thickness: 10, brightness: 1.3 };
                        const imgBanner = displaySettings.imageBannerSettings || { foldOffsetX: 0, foldOffsetY: 0, bannerOffsetX: 0, foldRotation: 0.5 };
                        
                        return (
                            <>
                                {/* Main banner panel */}
                                <img 
                                    src="/ui/banner-left.png"
                                    alt=""
                                    className="absolute top-0 h-full z-0"
                                    style={{
                                        left: `calc(-2px + ${imgBanner.bannerOffsetX}px)`,
                                        width: '35%',
                                        objectFit: 'cover',
                                        objectPosition: 'left top',
                                        filter: `hue-rotate(${colorAdj.hueRotation}deg) saturate(${colorAdj.saturation}) brightness(${colorAdj.brightness})`,
                                    }}
                                />
                                
                                {/* Fold accent - the diagonal stripe with notch */}
                                <img 
                                    src="/ui/fold-accent.png"
                                    alt=""
                                    className="absolute h-full z-[15]"
                                    style={{
                                        left: `calc(-8% - 10px + ${imgBanner.foldOffsetX}px)`,
                                        top: `${imgBanner.foldOffsetY}px`,
                                        width: '25%',
                                        objectFit: 'contain',
                                        objectPosition: 'left top',
                                        filter: `hue-rotate(${colorAdj.hueRotation}deg) brightness(${fold.brightness * colorAdj.brightness}) saturate(${colorAdj.saturation * 1.1})`,
                                        transform: `rotate(${imgBanner.foldRotation}deg)`,
                                        transformOrigin: 'top left',
                                    }}
                                />
                                
                                {/* Right banner stripe - darker version */}
                                <img 
                                    src="/ui/banner-right.png"
                                    alt=""
                                    className="absolute top-0 h-full z-[5]"
                                    style={{
                                        left: '25%',
                                        width: '15%',
                                        objectFit: 'contain',
                                        objectPosition: 'left top',
                                        filter: `hue-rotate(${colorAdj.hueRotation}deg) saturate(${colorAdj.saturation}) brightness(${colorAdj.brightness * 0.6})`,
                                    }}
                                />
                                
                            </>
                        );
                    })()
                ) : (
                    // CSS-based banner (fallback)
                    (() => {
                        const fold = displaySettings.foldSettings || { startY: 31, endX: 72, thickness: 10, brightness: 1.3 };
                        const foldOuterY = fold.startY + fold.thickness;
                        const foldEndXInContainer = (fold.endX / 100) * 20;
                        const cutoutXInBanner = (foldEndXInContainer / 38) * 100;
                        
                        return (
                            <>
                                {/* Main banner gradient */}
                                <div 
                                    className="absolute top-0 left-0 h-full z-0"
                                    style={{
                                        width: '38%',
                                        background: `linear-gradient(to right, ${heroData.bannerColor} 0%, ${heroData.bannerColor}ee 40%, ${heroData.bannerColor}99 70%, transparent 100%)`,
                                        clipPath: `polygon(0 0, 70% 0, 100% 100%, ${cutoutXInBanner}% 100%, 0 ${foldOuterY}%)`,
                                    }}
                                />
                                
                                {/* Banner fold/edge */}
                                <div 
                                    className="absolute z-[15]"
                                    style={{
                                        left: '0',
                                        top: '0',
                                        width: '20%',
                                        height: '100%',
                                        background: heroData.bannerColor,
                                        filter: `brightness(${fold.brightness}) saturate(1.15)`,
                                        clipPath: `polygon(0 ${fold.startY}%, 0 ${foldOuterY}%, ${fold.endX}% 100%)`,
                                    }}
                                />
                                
                                {/* Dark triangular accent at bottom-left */}
                                {!displaySettings.showBackground && (
                                    <div 
                                        className="absolute bottom-0 left-0 z-5"
                                        style={{
                                            width: `${foldEndXInContainer}%`,
                                            height: `${100 - foldOuterY}%`,
                                            background: '#000',
                                            clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
                                        }}
                                    />
                                )}
                            </>
                        );
                    })()
                )}
                
                {/* Hero Logo - appears in top-left of banner, behind the hero */}
                {heroData.heroLogo && (() => {
                    const logoSettings = heroData.heroLogoSettings || { offsetX: 0, offsetY: 0, scale: 1 };
                    const logoCrop = logoSettings.crop;
                    const hasLogoCrop = logoCrop && (logoCrop.top > 0 || logoCrop.left > 0 || logoCrop.right > 0 || logoCrop.bottom > 0);
                    
                    // Gradient mask for transparency fade (top-right full, bottom-left faded)
                    // 225deg points toward bottom-left, so gradient goes from top-right to bottom-left
                    const logoGradientStyle: React.CSSProperties = {
                        maskImage: 'linear-gradient(225deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 85%)',
                        WebkitMaskImage: 'linear-gradient(225deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 85%)',
                    };
                    
                    // Calculate crop transform if crop is defined
                    let logoCropStyle: React.CSSProperties | undefined;
                    let logoWrapperStyle: React.CSSProperties | undefined;
                    if (hasLogoCrop && logoCrop) {
                        const visibleWidth = 100 - logoCrop.left - logoCrop.right;
                        const visibleHeight = 100 - logoCrop.top - logoCrop.bottom;
                        const scaleX = 100 / visibleWidth;
                        const scaleY = 100 / visibleHeight;
                        const cropScale = Math.min(scaleX, scaleY);
                        const centerX = logoCrop.left + visibleWidth / 2;
                        const centerY = logoCrop.top + visibleHeight / 2;
                        
                        logoWrapperStyle = {
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...logoGradientStyle,
                        };
                        logoCropStyle = {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain' as const,
                            transform: `scale(${cropScale}) translate(${(50 - centerX)}%, ${(50 - centerY)}%)`,
                        };
                    }
                    
                    return (
                        <div 
                            className="absolute z-[8] flex items-center justify-center"
                            style={{
                                top: `calc(5% - ${logoSettings.offsetY}px)`,
                                left: `calc(2% + ${logoSettings.offsetX}px)`,
                                width: '25%',
                                height: '40%',
                                transform: `scale(${logoSettings.scale})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            {hasLogoCrop && logoWrapperStyle ? (
                                <div style={logoWrapperStyle}>
                                    <img 
                                        src={heroData.heroLogo}
                                        alt=""
                                        style={{ ...logoCropStyle, opacity: 0.55 }}
                                    />
                                </div>
                            ) : (
                                <img 
                                    src={heroData.heroLogo}
                                    alt=""
                                    className="w-full h-full object-contain"
                                    style={{ ...logoGradientStyle, opacity: 0.55 }}
                                />
                            )}
                        </div>
                    );
                })()}
                
                {/* Hero Portrait - separate layer behind content (z-10), clipped based on banner style */}
                {(() => {
                    const fold = displaySettings.foldSettings || { startY: 31, endX: 72, thickness: 10, brightness: 1.3 };
                    
                    let heroClipPath: string;
                    if (displaySettings.useImageBanner !== false) {
                        // For image banner - simple clip to match the banner shape approximately
                        heroClipPath = `polygon(0 0, 100% 0, 100% 100%, 45% 100%, 5% 30%, 0 30%)`;
                    } else {
                        // For CSS banner - use fold settings for precise clipping
                        const foldStartX = 0;
                        const foldStartY = fold.startY;
                        const foldEndX = (fold.endX / 100) * 20;
                        const heroLeft = -2;
                        const heroWidth = 35;
                        const toHeroX = (x: number) => ((x - heroLeft) / heroWidth) * 100;
                        const clipStartX = toHeroX(foldStartX);
                        const clipEndX = toHeroX(foldEndX);
                        heroClipPath = `polygon(0 0, 100% 0, 100% 100%, ${clipEndX}% 100%, ${clipStartX}% ${foldStartY}%, 0 ${foldStartY}%)`;
                    }
                    
                    return (
                        <div 
                            className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden z-10"
                            style={{
                                left: '-2%',
                                width: '35%',
                                clipPath: heroClipPath,
                            }}
                        >
                            <div 
                                className="w-full h-full"
                                style={{
                                    transform: `scale(${heroData.portraitSettings?.scale || 1}) translate(${heroData.portraitSettings?.offsetX || 0}%, ${-(heroData.portraitSettings?.offsetY || 0)}%)`,
                                }}
                            >
                                <HeroPortrait
                                    imageUrl={heroData.portraitImage}
                                    onImageUpload={onImageUpload}
                                    crop={heroData.portraitSettings?.crop}
                                    edgeFade={heroData.portraitSettings?.fadeAmount ?? 50}
                                />
                            </div>
                        </div>
                    );
                })()}

                {/* Content container - z-20, above hero image */}
                <div className="relative z-20 flex h-full">
                    {/* LEFT PANEL - Hero Info only (30% width) */}
                    <div className="w-[30%] flex-shrink-0 flex flex-col h-full relative">
                        {/* Info section - overlaying hero image with adjustable position */}
                        <div 
                            className="absolute left-4 right-2 z-10"
                            style={{
                                bottom: `calc(15% + ${heroData.heroInfoSettings?.offsetY || 0}px)`,
                                transform: `translateX(${heroData.heroInfoSettings?.offsetX || 0}px)`,
                            }}
                        >
                            {/* Page indicators */}
                            {heroData.additionalPages && heroData.additionalPages.length > 0 && (
                                <PageIndicator 
                                    pages={heroData.additionalPages}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                            
                            {/* Hero Name */}
                            <h1 className="text-5xl font-bold uppercase tracking-wider text-white drop-shadow-lg leading-tight">
                                {heroData.name}
                            </h1>

                            {/* Difficulty */}
                            <div className="flex items-center gap-4 mt-4">
                                <span className="text-xl text-gray-300 uppercase tracking-wide font-bold">DIFFICULTY</span>
                                <DifficultyStars difficulty={heroData.difficulty} />
                            </div>
                            
                            {/* Team-up Anchor */}
                            {heroData.teamUpAnchor?.enabled && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2">
                                        <img 
                                            src="/ui/team-up-anchor.png" 
                                            alt="" 
                                            className="h-5 object-contain"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-300 mt-1">
                                        {heroData.teamUpAnchor.bonusText}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        (Season Bonuses are always in effect, even without active Team-Ups.)
                                    </p>
                                </div>
                            )}
                            
                            {/* Role Badge */}
                            {displaySettings.showRoleBadge && (
                                <div className="mt-3">
                                    <img 
                                        src={getRoleIconPath(heroData.role)} 
                                        alt={heroData.role}
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT CONTENT AREA - Attacks & Abilities (70% width) - centered vertically */}
                    <div 
                        className="w-[70%] flex p-5 pl-4 pt-24"
                        style={{
                            transform: `translateY(${-(displaySettings.contentOffsetY || 0)}px)`,
                        }}
                    >
                        {currentPage === 0 ? renderMainPage() : (
                            heroData.additionalPages && heroData.additionalPages[currentPage - 1] && 
                            renderAdditionalPage(heroData.additionalPages[currentPage - 1])
                        )}
                    </div>
                </div>

                {/* Watermark - only visible in exported images */}
                <div 
                    className="export-only absolute bottom-3 left-4 z-50"
                    style={{ 
                        fontFamily: 'system-ui, sans-serif',
                        opacity: 0,
                    }}
                >
                    <span className="text-white/40 text-sm tracking-wide">
                        marvelrivalsconcepts.vercel.app
                    </span>
                </div>
            </div>
        );
    }
);

AbilityPageRenderer.displayName = 'AbilityPageRenderer';

export default AbilityPageRenderer;

import { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2, Undo2, Redo2, Eye, ChevronUp, ZoomIn, ZoomOut, Columns } from 'lucide-react';
import { getDefaultHeroData, getDefaultDisplaySettings, HeroData, DisplaySettings } from './types';
import { openInNewTab, preloadPresetImages } from './utils';
import { useHistory } from './hooks/useHistory';
import FormEditor from './components/FormEditor';
import AbilityPageRenderer from './components/AbilityPageRenderer';
import ExportButton from './components/ExportButton';

// Combined state for undo/redo to track both heroData and displaySettings together
interface AppState {
    heroData: HeroData;
    displaySettings: DisplaySettings;
}

function App() {
    const { 
        state: appState, 
        setState: setAppState, 
        undo, 
        redo, 
        canUndo, 
        canRedo 
    } = useHistory<AppState>({
        heroData: getDefaultHeroData(),
        displaySettings: getDefaultDisplaySettings(),
    });
    
    // Destructure for easier access
    const { heroData, displaySettings } = appState;
    
    // Wrapper to update heroData while keeping displaySettings
    const setHeroData = useCallback((newHeroData: HeroData | ((prev: HeroData) => HeroData)) => {
        setAppState((prev) => ({
            ...prev,
            heroData: typeof newHeroData === 'function' ? newHeroData(prev.heroData) : newHeroData,
        }));
    }, [setAppState]);
    
    // Wrapper to update displaySettings while keeping heroData
    const setDisplaySettings = useCallback((newSettings: DisplaySettings | ((prev: DisplaySettings) => DisplaySettings)) => {
        setAppState((prev) => ({
            ...prev,
            displaySettings: typeof newSettings === 'function' ? newSettings(prev.displaySettings) : newSettings,
        }));
    }, [setAppState]);
    
    // Batch update both heroData and displaySettings in a single history entry
    const setBoth = useCallback((newHeroData: HeroData, newDisplaySettings: DisplaySettings) => {
        setAppState({
            heroData: newHeroData,
            displaySettings: newDisplaySettings,
        });
    }, [setAppState]);
    const [showPreview, setShowPreview] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isOpeningTab, setIsOpeningTab] = useState(false);
    const [mobileTab, setMobileTab] = useState<'preview' | 'editor' | 'both'>('both');
    const [previewScale, setPreviewScale] = useState(75); // Default 75%
    const rendererRef = useRef<HTMLDivElement>(null);
    
    // "Both" mode pinned preview - pinch/zoom/pan state
    const [pinnedScale, setPinnedScale] = useState(0.32); // Default 32%
    const [pinnedPan, setPinnedPan] = useState({ x: 0, y: 0 });
    const pinnedPreviewRef = useRef<HTMLDivElement>(null);
    const pinchStateRef = useRef<{
        initialDistance: number;
        initialScale: number;
        initialPan: { x: number; y: number };
        lastTouchX: number;
        lastTouchY: number;
        isPinching: boolean;
        isDragging: boolean;
    } | null>(null);

    // Preload preset images on app mount
    useEffect(() => {
        preloadPresetImages();
    }, []);

    // Keyboard shortcuts for undo/redo (unified - always use app undo)
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ctrl+Z or Cmd+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y for redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }
    }, [undo, redo]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Pinned preview touch handlers for pinch-zoom and pan
    const getDistance = (touches: TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handlePinnedTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch start
            e.preventDefault();
            pinchStateRef.current = {
                initialDistance: getDistance(e.touches),
                initialScale: pinnedScale,
                initialPan: { ...pinnedPan },
                lastTouchX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                lastTouchY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                isPinching: true,
                isDragging: false,
            };
        } else if (e.touches.length === 1) {
            // Drag start
            pinchStateRef.current = {
                initialDistance: 0,
                initialScale: pinnedScale,
                initialPan: { ...pinnedPan },
                lastTouchX: e.touches[0].clientX,
                lastTouchY: e.touches[0].clientY,
                isPinching: false,
                isDragging: true,
            };
        }
    }, [pinnedScale, pinnedPan]);

    const handlePinnedTouchMove = useCallback((e: React.TouchEvent) => {
        if (!pinchStateRef.current) return;

        if (e.touches.length === 2 && pinchStateRef.current.isPinching) {
            // Pinch zoom
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            const scaleRatio = currentDistance / pinchStateRef.current.initialDistance;
            const newScale = Math.min(1.5, Math.max(0.15, pinchStateRef.current.initialScale * scaleRatio));
            setPinnedScale(newScale);
        } else if (e.touches.length === 1 && pinchStateRef.current.isDragging) {
            // Pan/drag
            const deltaX = e.touches[0].clientX - pinchStateRef.current.lastTouchX;
            const deltaY = e.touches[0].clientY - pinchStateRef.current.lastTouchY;
            setPinnedPan(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY,
            }));
            pinchStateRef.current.lastTouchX = e.touches[0].clientX;
            pinchStateRef.current.lastTouchY = e.touches[0].clientY;
        }
    }, []);

    const handlePinnedTouchEnd = useCallback(() => {
        pinchStateRef.current = null;
    }, []);

    // Reset pinned preview position when switching to "both" tab
    useEffect(() => {
        if (mobileTab === 'both') {
            setPinnedPan({ x: 0, y: 0 });
            setPinnedScale(0.32);
        }
    }, [mobileTab]);

    const handleOpenInNewTab = async () => {
        if (!rendererRef.current) return;
        
        setIsOpeningTab(true);
        try {
            await openInNewTab(
                rendererRef.current, 
                `${heroData.name.toLowerCase().replace(/\s+/g, '-')}-ability-page.png`
            );
        } catch (err) {
            console.error('Failed to open in new tab:', err);
        } finally {
            setIsOpeningTab(false);
        }
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setHeroData({
                ...heroData,
                portraitImage: e.target?.result as string,
            });
        };
        reader.readAsDataURL(file);
    };

    const handlePageChange = (page: number) => {
        setDisplaySettings({
            ...displaySettings,
            currentPage: page,
        });
    };

    return (
        <div className="min-h-screen bg-marvel-dark">
            {/* Header */}
            <header className="bg-marvel-metal border-b-2 border-marvel-yellow/30 py-3 px-4 md:py-4 md:px-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <img 
                            src="/favicon.png" 
                            alt="Marvel Rivals" 
                            className="w-10 h-10 md:w-14 md:h-14 object-contain"
                        />
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-marvel-yellow uppercase tracking-wider">
                                Marvel Rivals Ability Builder
                            </h1>
                            <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1 hidden sm:block">
                                Create custom hero ability pages | Assets from{' '}
                                <a 
                                    href="https://rivalskins.com/assets/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-marvel-yellow/70 hover:text-marvel-yellow underline"
                                >
                                    rivalskins.com
                                </a>
                            </p>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        {/* Undo/Redo Buttons */}
                        <div className="flex items-center gap-1 mr-1 md:mr-2">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className="p-2 rounded hover:bg-marvel-metal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 size={20} className="text-gray-300" />
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className="p-2 rounded hover:bg-marvel-metal transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Redo (Ctrl+Shift+Z)"
                            >
                                <Redo2 size={20} className="text-gray-300" />
                            </button>
                        </div>
                        
                        {/* Hide Preview - desktop only */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="hidden md:block bg-marvel-border text-white px-4 py-2 rounded hover:bg-marvel-metal transition-colors"
                        >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        
                        {/* Open in New Tab - desktop only */}
                        <button
                            onClick={handleOpenInNewTab}
                            disabled={isOpeningTab}
                            className="hidden md:flex bg-marvel-metal border border-marvel-yellow/50 text-marvel-yellow px-4 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-marvel-yellow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                        >
                            {isOpeningTab ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <ExternalLink size={18} />
                                    Preview
                                </>
                            )}
                        </button>
                        
                        {/* Export Button */}
                        <ExportButton
                            targetRef={rendererRef}
                            filename={`${heroData.name.toLowerCase().replace(/\s+/g, '-')}-ability-page.png`}
                            onExportStateChange={setIsExporting}
                        />
                    </div>
                </div>
            </header>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b border-marvel-border bg-marvel-metal">
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-2 text-center font-bold uppercase tracking-wider transition-colors text-sm ${
                        mobileTab === 'preview' 
                            ? 'text-marvel-yellow border-b-2 border-marvel-yellow bg-marvel-dark' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Eye size={16} className="inline mr-1" />
                    Preview
                </button>
                <button
                    onClick={() => setMobileTab('both')}
                    className={`flex-1 py-2 text-center font-bold uppercase tracking-wider transition-colors text-sm ${
                        mobileTab === 'both' 
                            ? 'text-marvel-yellow border-b-2 border-marvel-yellow bg-marvel-dark' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Columns size={16} className="inline mr-1" />
                    Both
                </button>
                <button
                    onClick={() => setMobileTab('editor')}
                    className={`flex-1 py-2 text-center font-bold uppercase tracking-wider transition-colors text-sm ${
                        mobileTab === 'editor' 
                            ? 'text-marvel-yellow border-b-2 border-marvel-yellow bg-marvel-dark' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <ChevronUp size={16} className="inline mr-1 rotate-90" />
                    Editor
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row md:h-[calc(100vh-88px)]">
                {/* Editor Panel - Hidden on mobile unless tab selected, always visible on desktop */}
                <div className={`w-full md:w-1/3 md:border-r border-marvel-border overflow-hidden md:h-auto ${
                    mobileTab === 'editor' ? 'block h-[calc(100vh-140px)]' : 
                    mobileTab === 'both' ? 'block h-[calc(100vh-140px-180px)]' : 'hidden md:block'
                }`}>
                    <FormEditor 
                        heroData={heroData} 
                        onChange={setHeroData}
                        displaySettings={displaySettings}
                        onDisplaySettingsChange={setDisplaySettings}
                        onBatchChange={setBoth}
                        rendererRef={rendererRef}
                        previewScale={previewScale}
                        onPreviewScaleChange={setPreviewScale}
                    />
                </div>

                {/* Preview Panel - Hidden on mobile unless tab selected, always visible on desktop */}
                {showPreview && (
                    <div className={`w-full md:flex-1 overflow-x-auto overflow-y-auto p-2 md:p-4 flex flex-col md:flex-row items-start relative ${
                        mobileTab === 'preview' ? 'flex' : 'hidden'
                    } md:flex`}>
                        {/* Mobile Zoom Slider - only shown on mobile in preview-only mode */}
                        <div className="md:hidden w-full flex items-center gap-3 mb-3 px-2 py-2 bg-marvel-metal/50 rounded-lg border border-marvel-border">
                            <ZoomOut size={16} className="text-gray-400 flex-shrink-0" />
                            <input
                                type="range"
                                min="25"
                                max="150"
                                value={previewScale}
                                onChange={(e) => setPreviewScale(Number(e.target.value))}
                                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-marvel-yellow"
                            />
                            <ZoomIn size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{previewScale}%</span>
                        </div>
                        
                        {/* Export/Preview Loading Overlay */}
                        {(isExporting || isOpeningTab) && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-marvel-dark/90 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-marvel-metal/80 border border-marvel-yellow/30 shadow-2xl">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-marvel-yellow/20 rounded-full"></div>
                                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-marvel-yellow rounded-full animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-marvel-yellow uppercase tracking-wider">
                                            {isExporting ? 'Exporting' : 'Generating Preview'}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {isExporting ? 'Downloading high-resolution PNG...' : 'Opening in new tab...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Responsive preview container */}
                        <div className="preview-container-mobile md:w-auto md:overflow-visible">
                            <div 
                                className="preview-scaler"
                                style={{ 
                                    transform: `scale(${previewScale / 100})`
                                }}
                            >
                                <AbilityPageRenderer
                                    ref={rendererRef}
                                    heroData={heroData}
                                    displaySettings={displaySettings}
                                    onImageUpload={handleImageUpload}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile "Both" Mode - Pinned Preview at Bottom */}
                {mobileTab === 'both' && showPreview && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[180px] bg-marvel-dark border-t-2 border-marvel-yellow/30 z-40">
                        {/* Export/Preview Loading Overlay for pinned preview */}
                        {(isExporting || isOpeningTab) && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-marvel-dark/90 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="animate-spin text-marvel-yellow" size={20} />
                                    <span className="text-marvel-yellow text-sm font-bold uppercase">
                                        {isExporting ? 'Exporting...' : 'Generating...'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Zoom indicator */}
                        <div className="absolute top-2 right-2 z-10 bg-black/60 px-2 py-1 rounded text-xs text-gray-300">
                            {Math.round(pinnedScale * 100)}%
                        </div>
                        {/* Pinch/drag preview container */}
                        <div 
                            ref={pinnedPreviewRef}
                            className="w-full h-full overflow-hidden flex items-center justify-center touch-none"
                            onTouchStart={handlePinnedTouchStart}
                            onTouchMove={handlePinnedTouchMove}
                            onTouchEnd={handlePinnedTouchEnd}
                            onTouchCancel={handlePinnedTouchEnd}
                        >
                            <div 
                                className="origin-center flex-shrink-0"
                                style={{ 
                                    transform: `scale(${pinnedScale}) translate(${pinnedPan.x / pinnedScale}px, ${pinnedPan.y / pinnedScale}px)`,
                                    transformOrigin: 'center center'
                                }}
                            >
                                <AbilityPageRenderer
                                    ref={rendererRef}
                                    heroData={heroData}
                                    displaySettings={displaySettings}
                                    onImageUpload={handleImageUpload}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;

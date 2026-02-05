import { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2, Undo2, Redo2, Eye, ChevronUp } from 'lucide-react';
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
    const [mobileTab, setMobileTab] = useState<'preview' | 'editor'>('preview');
    const rendererRef = useRef<HTMLDivElement>(null);

    // Preload preset images on app mount
    useEffect(() => {
        preloadPresetImages();
    }, []);

    // Keyboard shortcuts for undo/redo
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Check if user is typing in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }

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
                    className={`flex-1 py-3 text-center font-bold uppercase tracking-wider transition-colors ${
                        mobileTab === 'preview' 
                            ? 'text-marvel-yellow border-b-2 border-marvel-yellow bg-marvel-dark' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Eye size={18} className="inline mr-2" />
                    Preview
                </button>
                <button
                    onClick={() => setMobileTab('editor')}
                    className={`flex-1 py-3 text-center font-bold uppercase tracking-wider transition-colors ${
                        mobileTab === 'editor' 
                            ? 'text-marvel-yellow border-b-2 border-marvel-yellow bg-marvel-dark' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <ChevronUp size={18} className="inline mr-2 rotate-90" />
                    Editor
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row md:h-[calc(100vh-88px)]">
                {/* Editor Panel - Hidden on mobile unless tab selected, always visible on desktop */}
                <div className={`w-full md:w-1/3 md:border-r border-marvel-border overflow-hidden h-[calc(100vh-140px)] md:h-auto ${
                    mobileTab === 'editor' ? 'block' : 'hidden md:block'
                }`}>
                    <FormEditor 
                        heroData={heroData} 
                        onChange={setHeroData}
                        displaySettings={displaySettings}
                        onDisplaySettingsChange={setDisplaySettings}
                        onBatchChange={setBoth}
                        rendererRef={rendererRef}
                    />
                </div>

                {/* Preview Panel - Hidden on mobile unless tab selected, always visible on desktop */}
                {showPreview && (
                    <div className={`w-full md:flex-1 overflow-auto p-2 md:p-4 flex items-start justify-center relative ${
                        mobileTab === 'preview' ? 'block' : 'hidden md:flex'
                    }`}>
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
                                    transform: 'scale(var(--preview-scale, 0.75))'
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

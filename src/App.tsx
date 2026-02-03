import { useState, useRef, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2, Undo2, Redo2 } from 'lucide-react';
import { getDefaultHeroData, getDefaultDisplaySettings, HeroData, DisplaySettings } from './types';
import { openInNewTab, preloadPresetImages } from './utils';
import { useHistory } from './hooks/useHistory';
import FormEditor from './components/FormEditor';
import AbilityPageRenderer from './components/AbilityPageRenderer';
import ExportButton from './components/ExportButton';

function App() {
    const { 
        state: heroData, 
        setState: setHeroData, 
        undo, 
        redo, 
        canUndo, 
        canRedo 
    } = useHistory<HeroData>(getDefaultHeroData());
    
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(getDefaultDisplaySettings());
    const [showPreview, setShowPreview] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isOpeningTab, setIsOpeningTab] = useState(false);
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
            <header className="bg-marvel-metal border-b-2 border-marvel-yellow/30 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img 
                            src="/favicon.png" 
                            alt="Marvel Rivals" 
                            className="w-14 h-14 object-contain"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-marvel-yellow uppercase tracking-wider">
                                Marvel Rivals Ability Builder
                            </h1>
                        <p className="text-sm text-gray-400 mt-1">
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
                    <div className="flex items-center gap-3">
                        {/* Undo/Redo Buttons */}
                        <div className="flex items-center gap-1 mr-2">
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
                        
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="bg-marvel-border text-white px-4 py-2 rounded hover:bg-marvel-metal transition-colors"
                        >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        <button
                            onClick={handleOpenInNewTab}
                            disabled={isOpeningTab}
                            className="bg-marvel-metal border border-marvel-yellow/50 text-marvel-yellow px-4 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-marvel-yellow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        <ExportButton
                            targetRef={rendererRef}
                            filename={`${heroData.name.toLowerCase().replace(/\s+/g, '-')}-ability-page.png`}
                            onExportStateChange={setIsExporting}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-88px)]">
                {/* Editor Panel */}
                <div className="w-1/3 border-r border-marvel-border overflow-hidden">
                    <FormEditor 
                        heroData={heroData} 
                        onChange={setHeroData}
                        displaySettings={displaySettings}
                        onDisplaySettingsChange={setDisplaySettings}
                    />
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="flex-1 overflow-auto p-4 flex items-start justify-center relative">
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
                        <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
                            <AbilityPageRenderer
                                ref={rendererRef}
                                heroData={heroData}
                                displaySettings={displaySettings}
                                onImageUpload={handleImageUpload}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;

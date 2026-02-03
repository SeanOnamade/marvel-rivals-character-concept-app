import React, { useState, useRef } from 'react';
import { getDefaultHeroData, getDefaultDisplaySettings, HeroData, DisplaySettings } from './types';
import FormEditor from './components/FormEditor';
import AbilityPageRenderer from './components/AbilityPageRenderer';
import ExportButton from './components/ExportButton';

function App() {
    const [heroData, setHeroData] = useState<HeroData>(getDefaultHeroData());
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(getDefaultDisplaySettings());
    const [showPreview, setShowPreview] = useState(true);
    const rendererRef = useRef<HTMLDivElement>(null);

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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="bg-marvel-border text-white px-4 py-2 rounded hover:bg-marvel-metal transition-colors"
                        >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        <ExportButton
                            targetRef={rendererRef}
                            filename={`${heroData.name.toLowerCase().replace(/\s+/g, '-')}-ability-page.png`}
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
                    <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
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

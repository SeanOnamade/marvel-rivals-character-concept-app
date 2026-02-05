import React, { useState, useEffect } from 'react';
import { Download, Loader2, Check, AlertCircle, Share2 } from 'lucide-react';
import { exportToPNG, exportToBlob } from '../utils';

interface ExportButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    filename: string;
    onExportStateChange?: (isExporting: boolean) => void;
}

// Check if Web Share API with file sharing is available
const canShare = (): boolean => {
    return typeof navigator !== 'undefined' && 
           typeof navigator.share === 'function' && 
           typeof navigator.canShare === 'function';
};

// Get initial mobile state to avoid flicker
const getInitialMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};

const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename, onExportStateChange }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(getInitialMobile);

    // Track resize changes
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleShare = async () => {
        if (!targetRef.current) return;

        setIsExporting(true);
        setExportStatus('idle');
        setError(null);
        onExportStateChange?.(true);

        try {
            // Generate blob for sharing
            const blob = await exportToBlob(targetRef.current);
            const file = new File([blob], filename, { type: 'image/png' });

            // Check if we can share this file
            if (canShare() && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Marvel Rivals Ability Page',
                });
                setExportStatus('success');
            } else {
                // Fallback to download
                await exportToPNG(targetRef.current, filename);
                setExportStatus('success');
            }
            setTimeout(() => setExportStatus('idle'), 2000);
        } catch (err) {
            // User cancelled share or error occurred
            if ((err as Error).name === 'AbortError') {
                // User cancelled - not an error
                setExportStatus('idle');
            } else {
                // Try fallback download
                try {
                    await exportToPNG(targetRef.current, filename);
                    setExportStatus('success');
                    setTimeout(() => setExportStatus('idle'), 2000);
                } catch {
                    setExportStatus('error');
                    setError('Failed to export image. Please try again.');
                    console.error(err);
                }
            }
        } finally {
            setIsExporting(false);
            onExportStateChange?.(false);
        }
    };

    const handleExport = async () => {
        if (!targetRef.current) return;

        // On mobile, try to use share API first
        if (isMobile && canShare()) {
            return handleShare();
        }

        setIsExporting(true);
        setExportStatus('idle');
        setError(null);
        onExportStateChange?.(true);

        try {
            await exportToPNG(targetRef.current, filename);
            setExportStatus('success');
            // Reset success state after 2 seconds
            setTimeout(() => setExportStatus('idle'), 2000);
        } catch (err) {
            setExportStatus('error');
            setError('Failed to export image. Please try again.');
            console.error(err);
        } finally {
            setIsExporting(false);
            onExportStateChange?.(false);
        }
    };

    const getButtonContent = () => {
        const useShare = isMobile && canShare();
        
        if (isExporting) {
            return (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="hidden sm:inline">{useShare ? 'Sharing...' : 'Exporting...'}</span>
                    <span className="sm:hidden">{useShare ? 'Share' : 'Export'}</span>
                </>
            );
        }
        if (exportStatus === 'success') {
            return (
                <>
                    <Check size={20} />
                    <span className="hidden sm:inline">{useShare ? 'Shared!' : 'Exported!'}</span>
                    <span className="sm:hidden">Done!</span>
                </>
            );
        }
        if (exportStatus === 'error') {
            return (
                <>
                    <AlertCircle size={20} />
                    <span className="hidden sm:inline">Try Again</span>
                    <span className="sm:hidden">Retry</span>
                </>
            );
        }
        return (
            <>
                {useShare ? <Share2 size={20} /> : <Download size={20} />}
                <span className="hidden sm:inline">{useShare ? 'Share Image' : 'Export as PNG'}</span>
                <span className="sm:hidden">{useShare ? 'Share' : 'Export'}</span>
            </>
        );
    };

    const getButtonClasses = () => {
        const base = "px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base";
        if (exportStatus === 'success') {
            return `${base} bg-green-500 text-white`;
        }
        if (exportStatus === 'error') {
            return `${base} bg-red-500 text-white hover:bg-red-600`;
        }
        return `${base} bg-marvel-yellow text-black hover:bg-marvel-accent`;
    };

    return (
        <div>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className={getButtonClasses()}
            >
                {getButtonContent()}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default ExportButton;

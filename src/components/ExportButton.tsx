import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { exportToPNG } from '../utils';

interface ExportButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    filename: string;
    onExportStateChange?: (isExporting: boolean) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename, onExportStateChange }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        if (!targetRef.current) return;

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
        if (isExporting) {
            return (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Exporting...
                </>
            );
        }
        if (exportStatus === 'success') {
            return (
                <>
                    <Check size={20} />
                    Exported!
                </>
            );
        }
        if (exportStatus === 'error') {
            return (
                <>
                    <AlertCircle size={20} />
                    Try Again
                </>
            );
        }
        return (
            <>
                <Download size={20} />
                Export as PNG
            </>
        );
    };

    const getButtonClasses = () => {
        const base = "px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
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

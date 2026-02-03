import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToPNG } from '../utils';

interface ExportButtonProps {
    targetRef: React.RefObject<HTMLDivElement>;
    filename: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        if (!targetRef.current) return;

        setIsExporting(true);
        setError(null);

        try {
            await exportToPNG(targetRef.current, filename);
        } catch (err) {
            setError('Failed to export image. Please try again.');
            console.error(err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-marvel-yellow text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-marvel-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isExporting ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Exporting...
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Export as PNG
                    </>
                )}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default ExportButton;

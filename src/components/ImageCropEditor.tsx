import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface CropBounds {
    top: number;    // 0-100 percentage from top
    left: number;   // 0-100 percentage from left
    right: number;  // 0-100 percentage from right
    bottom: number; // 0-100 percentage from bottom
}

interface ImageCropEditorProps {
    imageUrl: string;
    initialCrop?: CropBounds;
    onApply: (crop: CropBounds) => void;
    onCancel: () => void;
}

const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
    imageUrl,
    initialCrop,
    onApply,
    onCancel,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [crop, setCrop] = useState<CropBounds>(initialCrop || {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    });
    const [dragging, setDragging] = useState<string | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startCrop, setStartCrop] = useState<CropBounds>(crop);

    const handleMouseDown = useCallback((edge: string, e: React.MouseEvent) => {
        e.preventDefault();
        setDragging(edge);
        setStartPos({ x: e.clientX, y: e.clientY });
        setStartCrop({ ...crop });
    }, [crop]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - startPos.x) / rect.width) * 100;
        const deltaY = ((e.clientY - startPos.y) / rect.height) * 100;

        const newCrop = { ...startCrop };

        switch (dragging) {
            case 'top':
                newCrop.top = Math.max(0, Math.min(100 - newCrop.bottom - 10, startCrop.top + deltaY));
                break;
            case 'bottom':
                newCrop.bottom = Math.max(0, Math.min(100 - newCrop.top - 10, startCrop.bottom - deltaY));
                break;
            case 'left':
                newCrop.left = Math.max(0, Math.min(100 - newCrop.right - 10, startCrop.left + deltaX));
                break;
            case 'right':
                newCrop.right = Math.max(0, Math.min(100 - newCrop.left - 10, startCrop.right - deltaX));
                break;
            case 'top-left':
                newCrop.top = Math.max(0, Math.min(100 - newCrop.bottom - 10, startCrop.top + deltaY));
                newCrop.left = Math.max(0, Math.min(100 - newCrop.right - 10, startCrop.left + deltaX));
                break;
            case 'top-right':
                newCrop.top = Math.max(0, Math.min(100 - newCrop.bottom - 10, startCrop.top + deltaY));
                newCrop.right = Math.max(0, Math.min(100 - newCrop.left - 10, startCrop.right - deltaX));
                break;
            case 'bottom-left':
                newCrop.bottom = Math.max(0, Math.min(100 - newCrop.top - 10, startCrop.bottom - deltaY));
                newCrop.left = Math.max(0, Math.min(100 - newCrop.right - 10, startCrop.left + deltaX));
                break;
            case 'bottom-right':
                newCrop.bottom = Math.max(0, Math.min(100 - newCrop.top - 10, startCrop.bottom - deltaY));
                newCrop.right = Math.max(0, Math.min(100 - newCrop.left - 10, startCrop.right - deltaX));
                break;
        }

        setCrop(newCrop);
    }, [dragging, startPos, startCrop]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragging, handleMouseMove, handleMouseUp]);

    const handleStyle = "absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 hover:bg-blue-100";
    const edgeHandleStyle = "absolute bg-blue-500 z-20";

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-auto p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 my-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Crop Image</h3>
                    <p className="text-sm text-gray-400">Drag the handles to crop</p>
                </div>

                {/* Centering wrapper for the image container */}
                <div className="flex justify-center">
                {/* Image container - sized to match image dimensions exactly */}
                {/* This ensures crop percentages are relative to the image, not a fixed container */}
                <div 
                    ref={containerRef}
                    className="relative bg-black rounded overflow-hidden mx-auto inline-block"
                    style={{ 
                        maxHeight: '50vh',
                        maxWidth: '100%',
                    }}
                >
                    {/* Image determines container size - no letterboxing */}
                    <img 
                        src={imageUrl} 
                        alt="Crop preview" 
                        className="block max-w-full max-h-[50vh] w-auto h-auto"
                    />

                    {/* Darkened overlay for cropped areas */}
                    <div 
                        className="absolute bg-black/60 pointer-events-none"
                        style={{ top: 0, left: 0, right: 0, height: `${crop.top}%` }}
                    />
                    <div 
                        className="absolute bg-black/60 pointer-events-none"
                        style={{ bottom: 0, left: 0, right: 0, height: `${crop.bottom}%` }}
                    />
                    <div 
                        className="absolute bg-black/60 pointer-events-none"
                        style={{ top: `${crop.top}%`, bottom: `${crop.bottom}%`, left: 0, width: `${crop.left}%` }}
                    />
                    <div 
                        className="absolute bg-black/60 pointer-events-none"
                        style={{ top: `${crop.top}%`, bottom: `${crop.bottom}%`, right: 0, width: `${crop.right}%` }}
                    />

                    {/* Crop border */}
                    <div 
                        className="absolute border-2 border-blue-500 pointer-events-none"
                        style={{
                            top: `${crop.top}%`,
                            left: `${crop.left}%`,
                            right: `${crop.right}%`,
                            bottom: `${crop.bottom}%`,
                        }}
                    />

                    {/* Edge handles */}
                    {/* Top edge */}
                    <div 
                        className={`${edgeHandleStyle} cursor-ns-resize`}
                        style={{
                            top: `${crop.top}%`,
                            left: `${crop.left + 2}%`,
                            right: `${crop.right + 2}%`,
                            height: '4px',
                            transform: 'translateY(-50%)',
                        }}
                        onMouseDown={(e) => handleMouseDown('top', e)}
                    />
                    {/* Bottom edge */}
                    <div 
                        className={`${edgeHandleStyle} cursor-ns-resize`}
                        style={{
                            bottom: `${crop.bottom}%`,
                            left: `${crop.left + 2}%`,
                            right: `${crop.right + 2}%`,
                            height: '4px',
                            transform: 'translateY(50%)',
                        }}
                        onMouseDown={(e) => handleMouseDown('bottom', e)}
                    />
                    {/* Left edge */}
                    <div 
                        className={`${edgeHandleStyle} cursor-ew-resize`}
                        style={{
                            left: `${crop.left}%`,
                            top: `${crop.top + 2}%`,
                            bottom: `${crop.bottom + 2}%`,
                            width: '4px',
                            transform: 'translateX(-50%)',
                        }}
                        onMouseDown={(e) => handleMouseDown('left', e)}
                    />
                    {/* Right edge */}
                    <div 
                        className={`${edgeHandleStyle} cursor-ew-resize`}
                        style={{
                            right: `${crop.right}%`,
                            top: `${crop.top + 2}%`,
                            bottom: `${crop.bottom + 2}%`,
                            width: '4px',
                            transform: 'translateX(50%)',
                        }}
                        onMouseDown={(e) => handleMouseDown('right', e)}
                    />

                    {/* Corner handles */}
                    <div 
                        className={handleStyle}
                        style={{ top: `${crop.top}%`, left: `${crop.left}%`, cursor: 'nwse-resize' }}
                        onMouseDown={(e) => handleMouseDown('top-left', e)}
                    />
                    <div 
                        className={handleStyle}
                        style={{ top: `${crop.top}%`, right: `${crop.right}%`, left: 'auto', transform: 'translate(50%, -50%)', cursor: 'nesw-resize' }}
                        onMouseDown={(e) => handleMouseDown('top-right', e)}
                    />
                    <div 
                        className={handleStyle}
                        style={{ bottom: `${crop.bottom}%`, left: `${crop.left}%`, top: 'auto', transform: 'translate(-50%, 50%)', cursor: 'nesw-resize' }}
                        onMouseDown={(e) => handleMouseDown('bottom-left', e)}
                    />
                    <div 
                        className={handleStyle}
                        style={{ bottom: `${crop.bottom}%`, right: `${crop.right}%`, top: 'auto', left: 'auto', transform: 'translate(50%, 50%)', cursor: 'nwse-resize' }}
                        onMouseDown={(e) => handleMouseDown('bottom-right', e)}
                    />
                </div>
                </div>

                {/* Crop values display */}
                <div className="flex gap-4 mt-4 text-sm text-gray-400">
                    <span>Top: {crop.top.toFixed(0)}%</span>
                    <span>Left: {crop.left.toFixed(0)}%</span>
                    <span>Right: {crop.right.toFixed(0)}%</span>
                    <span>Bottom: {crop.bottom.toFixed(0)}%</span>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={() => setCrop({ top: 0, left: 0, right: 0, bottom: 0 })}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={() => onApply(crop)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropEditor;

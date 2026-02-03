import React, { useRef, useState } from 'react';

interface CropBounds {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

interface HeroPortraitProps {
    imageUrl?: string;
    onImageUpload: (file: File) => void;
    crop?: CropBounds;
    edgeFade?: number; // 0-100, percentage of edge fade
}

const HeroPortrait: React.FC<HeroPortraitProps> = ({ imageUrl, onImageUpload, crop, edgeFade = 0 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };

    // Crop with proper scaling and positioning
    const hasCrop = crop && (crop.top > 0 || crop.left > 0 || crop.right > 0 || crop.bottom > 0);
    
    let imageStyle: React.CSSProperties = {
        maxHeight: '100%',
    };

    if (hasCrop && crop) {
        // Calculate the visible portion as a percentage
        const visibleWidth = 100 - crop.left - crop.right;
        const visibleHeight = 100 - crop.top - crop.bottom;
        
        // Calculate scale to fill the container
        // We need to scale up by 100/visiblePercent
        const scaleX = 100 / visibleWidth;
        const scaleY = 100 / visibleHeight;
        
        // Use the larger scale to ensure the cropped area fills the container
        const scale = Math.max(scaleX, scaleY);
        
        // Calculate the offset to center the visible portion
        // The crop removes crop.left% from left and crop.right% from right
        // After scaling, we need to shift the image so the visible center aligns with container center
        const centerX = crop.left + visibleWidth / 2; // Center of visible area as % of original
        const centerY = crop.top + visibleHeight / 2;
        
        // Offset needed: (50 - center) * scale
        // This shifts the image so the visible center is at 50%
        const offsetX = (50 - centerX) * scale;
        const offsetY = (50 - centerY) * scale;
        
        imageStyle = {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            transform: `scale(${scale}) translate(${offsetX / scale}%, ${offsetY / scale}%)`,
            transformOrigin: 'center center',
            clipPath: `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`,
        };
    }

    // Calculate edge fade - use mask for preview, but it won't work in export
    // This is a known limitation of html-to-image library
    const fadePercent = (edgeFade / 100) * 25; // Max 25% fade from each edge
    const edgeFadeMask = edgeFade > 0 
        ? `linear-gradient(to bottom, black 0%, black ${100 - fadePercent * 2}%, transparent 100%)`
        : undefined;

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Tall rectangular portrait area with edge fade */}
            <div
                className={`w-full h-full cursor-pointer transition-all ${
                    isDragging ? 'opacity-80' : ''
                }`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={edgeFade > 0 ? {
                    maskImage: edgeFadeMask,
                    WebkitMaskImage: edgeFadeMask,
                } : undefined}
            >
                {imageUrl && (
                    <img 
                        src={imageUrl} 
                        alt="Hero Portrait" 
                        className="w-full h-full object-contain object-bottom"
                        style={imageStyle}
                    />
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default HeroPortrait;

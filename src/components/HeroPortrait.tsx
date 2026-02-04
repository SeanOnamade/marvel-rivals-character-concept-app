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
    
    // Calculate crop wrapper styles (used when hasCrop is true)
    let cropWrapperStyle: React.CSSProperties | undefined;
    let croppedImageStyle: React.CSSProperties | undefined;
    
    if (hasCrop && crop) {
        // Calculate the visible portion as a percentage of the original image
        const visibleWidth = 100 - crop.left - crop.right;
        const visibleHeight = 100 - crop.top - crop.bottom;
        
        // Scale factor to make the visible region fill the container
        const scale = Math.max(100 / visibleWidth, 100 / visibleHeight);
        
        // Center of the visible region as percentage of original image
        const centerX = crop.left + visibleWidth / 2;
        const centerY = crop.top + visibleHeight / 2;
        
        // Position a scaled wrapper so the visible region is centered in the container
        // Wrapper is scale * 100% of the container
        // Visible center in wrapper coords: centerX% of wrapper width = centerX * scale % of container
        // We want this at 50% of container, so wrapper left = 50 - centerX * scale
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
                    hasCrop && cropWrapperStyle && croppedImageStyle ? (
                        // Cropped image: use a positioned wrapper
                        <div style={cropWrapperStyle}>
                            <img 
                                src={imageUrl} 
                                alt="Hero Portrait" 
                                style={croppedImageStyle}
                            />
                        </div>
                    ) : (
                        // Non-cropped image: simple display
                        <img 
                            src={imageUrl} 
                            alt="Hero Portrait" 
                            className="w-full h-full object-contain object-bottom"
                        />
                    )
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

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    /** Force open on desktop (md and up) */
    alwaysOpenOnDesktop?: boolean;
    className?: string;
}

// Check initial desktop state (runs once at module load)
const getInitialDesktop = () => {
    if (typeof window === 'undefined') return true; // SSR fallback
    return window.innerWidth >= 768;
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    children,
    defaultOpen = false,
    alwaysOpenOnDesktop = true,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isDesktop, setIsDesktop] = useState(getInitialDesktop);

    // Track resize changes
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // On desktop, always show content if alwaysOpenOnDesktop is true
    const shouldShowContent = (alwaysOpenOnDesktop && isDesktop) || isOpen;

    // Only show collapse controls on mobile (or if alwaysOpenOnDesktop is false)
    const showCollapseControls = !alwaysOpenOnDesktop || !isDesktop;

    return (
        <div className={`collapsible-section ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`collapsible-header w-full text-left ${showCollapseControls ? '' : 'cursor-default'}`}
                disabled={!showCollapseControls}
            >
                <h3 className="text-lg font-semibold text-marvel-accent flex items-center gap-2">
                    {showCollapseControls && (
                        isOpen ? (
                            <ChevronDown size={18} className="text-marvel-accent" />
                        ) : (
                            <ChevronRight size={18} className="text-marvel-accent" />
                        )
                    )}
                    {title}
                </h3>
            </button>
            <div 
                className={`collapsible-content ${shouldShowContent ? '' : 'collapsed'}`}
                style={{ 
                    maxHeight: shouldShowContent ? 'none' : 0,
                    opacity: shouldShowContent ? 1 : 0,
                    transition: 'max-height 0.3s ease-out, opacity 0.2s ease-out'
                }}
            >
                <div className="px-4 pb-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;

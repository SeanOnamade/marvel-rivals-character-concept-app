import React from 'react';

interface AbilityCardProps {
    name: string;
    description: string;
    hotkey: string;
    icon?: string;
    variant?: 'attack' | 'ability' | 'ultimate' | 'passive';
}

const AbilityCard: React.FC<AbilityCardProps> = ({
    name,
    description,
    hotkey,
    variant = 'ability'
}) => {
    return (
        <div className="bg-ability-card rounded p-3 mb-3 hover:border-glow transition-all">
            <div className="flex items-start gap-3">
                {/* Diamond Icon Container */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 diamond-shape bg-marvel-metal border border-marvel-yellow/50 flex items-center justify-center">
                        <div className="diamond-content">
                            <div className="w-8 h-8 bg-gradient-to-br from-marvel-yellow/20 to-transparent rounded" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {/* Hotkey Badge */}
                        <div className="bg-marvel-yellow text-black px-2 py-0.5 rounded text-xs font-bold">
                            {hotkey}
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-wide">{name}</h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default AbilityCard;

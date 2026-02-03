import React from 'react';

interface DifficultyStarsProps {
    difficulty: number;
}

const DifficultyStars: React.FC<DifficultyStarsProps> = ({ difficulty }) => {
    return (
        <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <img
                    key={star}
                    src="/ui/difficulty-star.png"
                    alt=""
                    className="w-10 h-10 object-contain"
                    style={star <= difficulty ? {} : { filter: 'grayscale(1) brightness(0.5)' }}
                />
            ))}
        </div>
    );
};

export default DifficultyStars;

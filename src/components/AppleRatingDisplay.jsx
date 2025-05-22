import React from 'react';
import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';

const PartialAppleDisplay = ({ fillPercent, size }) => (
  <div className={`relative ${size} inline-block`}>
    <Apple className={`absolute top-0 left-0 ${size} text-gray-500`} />
    <div
      className={`absolute top-0 left-0 h-full overflow-hidden`}
      style={{ width: `${fillPercent}%` }}
    >
      <div className={`${size}`}>
        <Apple className={`${size} text-yellow-400 fill-yellow-400`} />
      </div>
    </div>
  </div>
);

export default function AppleRatingDisplay({ rating, appleSize = "w-5 h-5", onAppleClick = null, interactive = false }) {
  const numericRating = Number(rating);

  if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
    return <span className="text-xs text-gray-400">No rating</span>;
  }

  const fullApples = Math.floor(numericRating);
  const partialFillPercent = (numericRating - fullApples) * 100;
  const hasPartialApple = partialFillPercent > 1;
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  const handleAppleClick = (index) => {
    if (interactive && onAppleClick) {
      onAppleClick(index);
    }
  };

  const appleElements = [];

  for (let i = 0; i < fullApples; i++) {
    appleElements.push(
      <motion.div 
        key={`full-${i}`} 
        whileHover={interactive ? { scale: 1.2 } : {}}
        onClick={() => handleAppleClick(i + 1)}
        className={`${interactive ? 'cursor-pointer' : ''} flex items-center justify-center`}
      >
        <Apple
          className={`${appleSize} text-yellow-400 fill-yellow-400`}
        />
      </motion.div>
    );
  }

  if (hasPartialApple) {
    appleElements.push(
      <motion.div 
        key="partial" 
        whileHover={interactive ? { scale: 1.2 } : {}}
        onClick={() => handleAppleClick(fullApples + 1)}
        className={`${interactive ? 'cursor-pointer' : ''} flex items-center justify-center`}
      >
        <PartialAppleDisplay fillPercent={partialFillPercent} size={appleSize} />
      </motion.div>
    );
  }

  for (let i = 0; i < emptyApples; i++) {
    appleElements.push(
      <motion.div 
        key={`empty-${i}`} 
        whileHover={interactive ? { scale: 1.2 } : {}}
        onClick={() => handleAppleClick(fullApples + (hasPartialApple ? 1 : 0) + i + 1)}
        className={`${interactive ? 'cursor-pointer' : ''} flex items-center justify-center`}
      >
        <Apple
          className={`${appleSize} text-gray-500`}
        />
      </motion.div>
    );
  }
  
  while (appleElements.length < 5) {
    appleElements.push(
      <motion.div 
        key={`placeholder-${appleElements.length}`}
        className={`flex items-center justify-center`}
      >
        <Apple
            className={`${appleSize} text-transparent fill-transparent`}
          />
      </motion.div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {appleElements.slice(0, 5)}
    </div>
  );
}
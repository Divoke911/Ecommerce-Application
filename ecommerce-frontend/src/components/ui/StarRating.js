import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, maxRating = 5, size = 16, interactive = false, onChange }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i < Math.round(rating)
              ? 'fill-[#fb641b] text-[#fb641b]'
              : 'fill-gray-200 text-gray-200'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
};

export default StarRating;
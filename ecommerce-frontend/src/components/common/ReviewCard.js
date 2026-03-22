import React from 'react';
import { formatDate, getInitials } from '../../utils';
import StarRating from '../ui/StarRating';

const ReviewCard = ({ review }) => {
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {getInitials(review.userName)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">
              {review.userName}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <StarRating rating={review.rating} size={14} />
          {review.title && (
            <p className="text-sm font-medium text-gray-800 mt-1">
              {review.title}
            </p>
          )}
          {review.body && (
            <p className="text-sm text-gray-600 mt-1">{review.body}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
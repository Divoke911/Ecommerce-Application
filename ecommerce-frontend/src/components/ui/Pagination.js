import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visiblePages = pages.filter(
    (p) => p === 0 || p === totalPages - 1 ||
      Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <ChevronLeft size={16} />
      </Button>

      {visiblePages.map((page, idx) => {
        const prevPage = visiblePages[idx - 1];
        const showEllipsis = prevPage !== undefined && page - prevPage > 1;

        return (
          <React.Fragment key={page}>
            {showEllipsis && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#2874f0] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {page + 1}
            </button>
          </React.Fragment>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
import React from 'react';
import { clsx } from 'clsx';

const Input = ({
  label,
  error,
  helperText,
  className = '',
  required = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={clsx(
            'w-full border rounded px-3 py-2 text-sm text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent',
            'placeholder:text-gray-400 transition-all duration-200',
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
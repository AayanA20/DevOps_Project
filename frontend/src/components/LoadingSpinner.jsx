import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.medium} border-instagram-border border-t-instagram-blue rounded-full animate-spin`}
      />
      {text && <p className="text-xs text-instagram-secondary font-medium tracking-wide">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;


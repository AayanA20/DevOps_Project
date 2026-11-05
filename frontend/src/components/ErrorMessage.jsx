import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between my-3 text-sm">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 text-xs font-semibold text-red-700 hover:text-red-900 underline focus:outline-none"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

"use client";
import { useState } from 'react';

export default function CollapsibleSection({ title, children, defaultOpen = false, status = 'empty' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const statusColors = {
    complete: 'bg-green-500',
    partial: 'bg-yellow-500', 
    empty: 'bg-gray-300'
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div 
        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${isOpen ? 'border-b border-gray-200' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold font-lato text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}
import React from 'react';

interface AdPlaceholderProps {
  width?: string;
  height?: string;
  label?: string;
  className?: string;
}

export default function AdPlaceholder({ 
  width = 'w-full', 
  height = 'h-[90px]', 
  label = 'ADVERTISEMENT',
  className = ''
}: AdPlaceholderProps) {
  return (
    <div className={`flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 ${width} ${height} ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{label}</span>
        <span className="text-xs opacity-50">Space Available</span>
      </div>
    </div>
  );
}

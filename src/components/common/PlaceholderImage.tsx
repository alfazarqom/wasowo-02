import React from 'react';

export function PlaceholderImage({ text }: { text: string }) {
  return (
    <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-center p-4 text-center select-none">
      <svg className="w-10 h-10 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-[11px] font-medium text-neutral-500 line-clamp-1">{text}</span>
    </div>
  );
}

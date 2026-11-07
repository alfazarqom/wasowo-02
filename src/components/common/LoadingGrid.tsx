import React from 'react';

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-neutral-800/40 border border-neutral-800 rounded-2xl h-72"></div>
      ))}
    </div>
  );
}

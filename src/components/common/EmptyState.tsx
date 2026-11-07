import React from 'react';

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="py-12 text-center space-y-2 border border-dashed border-neutral-800 rounded-2xl">
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}

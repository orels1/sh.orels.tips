'use client';
import clsx from "clsx";
import { useState } from 'react';

const COLORS: Record<string, string> = {
  'Unity': 'bg-indigo-400/10 text-indigo-400 ring-indigo-400/30',
  'Unreal': 'bg-pink-400/10 text-pink-400 ring-pink-400/30',
  'Assets': 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/30',
  'Source Files': 'bg-orange-400/10 text-orange-400 ring-orange-400/30',
  'Shaders': 'bg-purple-400/10 text-purple-400 ring-purple-400/30',
  'References': 'bg-red-400/10 text-red-400 ring-red-400/30',
  'Editor Scripts': 'bg-sky-400/10 text-sky-400 ring-sky-400/30',
  'Blender': 'bg-amber-400/10 text-amber-400 ring-amber-400/30',
  'Udon': 'bg-lime-400/10 text-lime-400 ring-lime-400/30',
  'Tech Art': 'bg-rose-400/10 text-rose-400 ring-rose-400/30',
}


export default function TipCategory({
  category,
  count,
  children
} : {
  category: string;
  count: number;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div key={category} className="flex flex-col group/category">
      <div className="flex mt-2 mb-2">
        <div
          className={clsx(
            COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
            'inline-flex items-center rounded-l-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
          )}
        >
          {category}
        </div>
        <div
          className={clsx(
            COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
            'inline-flex items-center px-2 py-1 mx-1 text-xs font-medium ring-1 ring-inset'
          )}
        >
          {count}
        </div>
        <div
          className={clsx(
            COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
            'inline-flex items-center grow px-2 py-1 text-xs font-medium ring-1 ring-inset'
          )}
        />
        <button
          type="button"
          title={expanded ? 'Collapse' : 'Expand'}
          className={clsx(
            COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
            'items-center ml-1 rounded-r-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse ▲' : 'Expand ▼'}
        </button>
      </div>
      <div className={clsx(!expanded && 'hidden')}>
        {children}
      </div>
      {expanded && (
        <div className="mb-6" />
      )}
    </div>
  )
}
'use client';
import Link from "next/link";
import { MagnifyingGlassIcon, AcademicCapIcon, BookOpenIcon, LightBulbIcon, DocumentArrowDownIcon, LinkIcon } from '@heroicons/react/24/outline';
import clsx from "clsx";
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from "react";

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


const ICONS: Record<string, React.ReactNode> = {
  'talk': <AcademicCapIcon />,
  'guide': <BookOpenIcon />,
  'tip': <LightBulbIcon />,
  'source': <DocumentArrowDownIcon />,
  'link': <LinkIcon />,
}

export default function FilteredTips({
  tips,
} : {
  tips: Array<{
    frontmatter: {
      title: string;
      link?: string;
      type: string;
      tags: string[];
    };
    slug: string;
  }>;
}) {
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const search = searchParams.get('search')?.toLowerCase();
    const tag = searchParams.get('tag')?.toLowerCase();

    if (search === undefined && tag === undefined) {
      return tips;
    }

    return tips.filter((tip) => {
      if (search !== undefined) {
        if (tip.frontmatter.title.toLowerCase().includes(search)) {
          return true;
        }
        if (tip.frontmatter.tags.some((tag) => tag.toLowerCase().includes(search))) {
          return true;
        }
      }

      if (tag !== undefined) {
        if (tip.frontmatter.tags.some((t) => t.toLowerCase() === tag)) {
          return true;
        }
      }

      return false;
    });
  }, [tips, searchParams]);

  return (
    <ul role="list" className="divide-y divide-solid divide-white/10 sm:divide-none">
      {filtered.map((tip) => (
        <li key={tip.frontmatter.title} className="my-2 sm:my-0 first:mt-0">
          <Link href={tip.frontmatter.link ?? `/${tip.slug}`} target={tip.frontmatter.link !== undefined ? '_blank' : '_self'} className="relative flex flex-col sm:flex-row justify-between sm:items-center gap-x-6 group">
            <div className="py-2 pr-3 flex items-center gap-x-2">
              <div className="w-[24px] h-[24px] scale-75 relative top-1">
                {ICONS?.[tip.frontmatter.type] ?? <LightBulbIcon />}
              </div>
              <div className="sm:whitespace-nowrap leading-6 sm:leading-normal text-sm font-semibold dark:text-gray-400 dark:group-hover:text-gray-100 transition-colors text-gray-900 group-hover:text-gray-700">
                <span className="underline-offset-8 underline">{tip.frontmatter.title}</span>
                {tip.frontmatter.link !== undefined && (
                  <span className="hidden sm:inline-flex opacity-0 group-hover:opacity-50 text-xs ml-4 transition-opacity">opens in new tab</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="whitespace-nowrap pl-3 py-2 flex flex-wrap gap-2 text-sm">
                {tip.frontmatter.tags?.map((tag) => (
                  <span key={tag} className={clsx(
                        COLORS?.[tag] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
                      'inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium ring-1 ring-inset'
                    )}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
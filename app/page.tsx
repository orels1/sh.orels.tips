import 'server-only';
import { compileMDX } from 'next-mdx-remote/rsc';
import { MagnifyingGlassIcon, AcademicCapIcon, BookOpenIcon, LightBulbIcon, DocumentArrowDownIcon, LinkIcon } from '@heroicons/react/24/outline';
import fs from 'fs/promises';
import path from 'path';
import clsx from 'clsx';
import Link from 'next/link';
import TipRow from '@/components/TipRow';
import dayjs from 'dayjs';
import TipCategory from '@/components/TipCategory';
import FilteredTips from '@/components/FilteredTips';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchContextProvider from '@/searchContext';

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

const getTipsList = async () => {
  const tipsPaths = (await fs.readdir(path.join('app', '_tips'))).filter((postFilePath) => {
    return path.extname(postFilePath).toLowerCase() === ".mdx";
  });

  const tipsList = await Promise.all(tipsPaths.map(async (tipPath) => {
    const slug = tipPath.slice(0, -4);
    const content = await fs.readFile(path.join('app', '_tips', tipPath), 'utf-8');
    const { frontmatter } = await compileMDX<{
      title: string;
      tags: string[];
      type: string;
      link?: string;
      created: string;
    }>({
      source: content,
      options: { parseFrontmatter: true }
    });
    return {
      path: tipPath,
      frontmatter,
      slug
    }
  }));

  return tipsList.sort((a, b) => dayjs(a.frontmatter.created).isBefore(dayjs(b.frontmatter.created)) ? 1 : -1);
}

export default async function Home() {
  const allTips = await getTipsList();
  const groupedTips = allTips.reduce((acc, tip) => {
    for (const tag of tip.frontmatter.tags ?? []) {
      if (!acc[tag]) {
        acc[tag] = [];
      }
      acc[tag].push(tip);
    }
    return acc;
  }, {} as Record<string, typeof allTips>);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex w-full items-start flex-col">
        <div className="max-w-3xl text-sm pb-2 leading-6 dark:text-slate-400 text-slate-700">
          This is my personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that
        </div>
      </div>
      <SearchContextProvider>
      <div className="flex w-full items-center py-2">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchBar />
        </Suspense>
      </div>
      <div className="grow w-full mt-2 flow-root">
        {Object.entries(groupedTips).map(([category, tips]) => (
          <TipCategory key={category} category={category} count={tips.length}>
            <FilteredTips tips={tips} />
          </TipCategory>
        ))}
      </div>
      </SearchContextProvider>
    </main>
  )
}

import 'server-only';
import { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'orels\' Tips',
  description: 'My personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that',
  metadataBase: new URL('https://tips.orels.sh'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tips.orels.sh',
    description: 'My personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that',
    title: 'orels\' Tips',
    siteName: 'orels\' Tips',
    images: ['https://tips.orels.sh/orels-tips-splash.png'],
  },
  twitter: {
    site: '@orels1_',
    card: 'summary_large_image',
    description: 'My personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that',
    title: 'orels\' Tips',
    images: ['https://tips.orels.sh/orels-tips-splash.png'],
  },
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

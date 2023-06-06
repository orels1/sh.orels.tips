import 'server-only';
import { compileMDX } from 'next-mdx-remote/rsc';
import { MagnifyingGlassIcon, AcademicCapIcon, BookOpenIcon, LightBulbIcon, DocumentArrowDownIcon, LinkIcon } from '@heroicons/react/24/outline';
import fs from 'fs/promises';
import path from 'path';
import clsx from 'clsx';
import Link from 'next/link';
import TipRow from '@/components/TipRow';
import dayjs from 'dayjs';

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
      <div className="flex col w-full max-w-5xl pb-2 leading-7">
        This is my personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that
      </div>
      <div className="flex w-full max-w-5xl  items-center py-2">
        <div className="w-full">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full md:rounded-md border-0 dark:bg-white/10 dark:ring-white/10 bg-white py-1.5 pl-10 pr-3 dark:text-gray-200 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-300 sm:text-sm sm:leading-6"
              placeholder="Search"
              type="search"
            />
          </div>
        </div>
      </div>
      <div className="grow w-full max-w-5xl flow-root">
        {Object.entries(groupedTips).map(([category, tips]) => (
          <div key={category} className="flex flex-col group/category">
            <div className="flex">
              <div
                className={clsx(
                  COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
                  'inline-flex items-center rounded-l-md px-2 py-1 text-xs font-medium ring-1 ring-inset mb-2 mt-8 group-first/category:mt-2'
                )}
              >
                {category}
              </div>
              <div
                className={clsx(
                  COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
                  'inline-flex items-center px-2 py-1 mx-1 text-xs font-medium ring-1 ring-inset mb-2 mt-8 group-first/category:mt-2'
                )}
              >
                {tips.length}
              </div>
              <div
                className={clsx(
                  COLORS?.[category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
                  'inline-flex items-center rounded-r-md grow px-2 py-1 text-xs font-medium ring-1 ring-inset mb-2 mt-8 group-first/category:mt-2'
                )}
              />
            </div>
            <ul role="list" className="divide-y divide-solid divide-white/10 sm:divide-none">
              {tips.map((tip) => (
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
                      {/* <div className="whitespace-nowrap px-3 py-2 text-sm">
                        <span
                          className={clsx(
                            COLORS?.[tip.frontmatter.category] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20',
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset '
                          )}
                        >
                          {tip.frontmatter.category}
                        </span>
                      </div> */}
                      <div className="whitespace-nowrap px-3 py-2 flex flex-wrap gap-2 text-sm">
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
          </div>
        ))}
      </div>
    </main>
  )
}

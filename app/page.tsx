import 'server-only';
import TipCategory from '@/components/TipCategory';
import FilteredTips from '@/components/FilteredTips';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchContextProvider from '@/searchContext';
import contentMap from './content-map.json';


export default async function Home() {
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
          {Object.entries(contentMap).map(([category, tips]) => (
            <TipCategory key={category} category={category} count={tips.length}>
              <Suspense fallback={<div>Loading...</div>}>
                <FilteredTips tips={tips} />
              </Suspense>
            </TipCategory>
          ))}
        </div>
      </SearchContextProvider>
    </main>
  )
}

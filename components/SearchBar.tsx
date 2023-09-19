'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { SearchContext } from '@/searchContext';

export default function SearchBar() {
  const { search, setSearch } = useContext(SearchContext);
  
  const handleSearchChange = ({ target: { value = '' }}: React.ChangeEvent<HTMLInputElement>) => {
    console.log('setting search to ', value);
    setSearch(value);
  }

  return (
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
          value={search}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  )
}

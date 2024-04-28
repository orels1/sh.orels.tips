'use client';
import { createContext, useState } from "react";
import contentMap from '@/app/content-map.json';

export const SearchContext = createContext<{
  search: string;
  tags: string[];
  setSearch: (search: string) => void;
  setTags: (tags: string[]) => void;
}>({
  search: '',
  tags: [],
  setSearch: (search: string) => {},
  setTags: (tags: string[]) => {}
});

const defaultTaags = Object.keys(contentMap);

export default function SearchContextProvider({
  children
} : {
  children: React.ReactNode
}) {
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  return (
    <SearchContext.Provider value={{
      search,
      setSearch,
      tags,
      setTags
    }}>
      {children}
    </SearchContext.Provider>
  );
}


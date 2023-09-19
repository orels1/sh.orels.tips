'use client';
import { createContext, useState } from "react";

export const SearchContext = createContext<{
  search: string;
  setSearch: (search: string) => void;
}>({
  search: '',
  setSearch: (search: string) => {}
});

export default function SearchContextProvider({
  children
} : {
  children: React.ReactNode
}) {
  const [search, setSearch] = useState('');

  console.log('search state updated to', search);

  return (
    <SearchContext.Provider value={{
      search,
      setSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
}


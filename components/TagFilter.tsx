"use client"

import { Check, ChevronsUpDown } from "lucide-react";
import contentMap from '@/app/content-map.json';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useContext, useState } from "react";
import { SearchContext } from "@/searchContext";

const options = Object.keys(contentMap).sort((a, b) => a.localeCompare(b)).map(key => ({
  value: key,
  label: key,
}))

export default function TagFilter() {
  const [open, setOpen] = useState(false);
  const { tags, setTags } = useContext(SearchContext);

  const handleSelect = (selected: string) => {
    const option = options.find((tag) => tag.value === selected);
    if (!option) return;

    if (tags.includes(option.value)) {
      setTags(tags.filter((v) => v !== option.value));
    } else {
      setTags([...tags, option.value]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] py-2 h-auto border-0 justify-between dark:bg-white/10 dark:ring-white/10 bg-white dark:text-gray-200 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-300"
        >
          Filter by Tag
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command disablePointerSelection={false}>
          <CommandInput placeholder="Search Tags..." />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {options.map((tag) => (
                <CommandItem
                  key={tag.value}
                  value={tag.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      tags.includes(tag.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tag.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

"use client";
import Link from "next/link";
import {
  AcademicCapIcon,
  BookOpenIcon,
  LightBulbIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useContext, useMemo } from "react";
import { COLORS } from "@/utils/constants";
import { SearchContext } from "@/searchContext";
import { hasIntersection } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  talk: <AcademicCapIcon />,
  guide: <BookOpenIcon />,
  tip: <LightBulbIcon />,
  source: <DocumentArrowDownIcon />,
  link: <LinkIcon />,
  snippet: <DocumentTextIcon />,
};

export default function FilteredTips({
  tips,
}: {
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
  const { search, tags } = useContext(SearchContext);

  const filtered = useMemo(() => {
    // const tag = searchParams.get('tag')?.toLowerCase();

    if ((search === undefined || search.length === 0) && tags.length === 0) {
      return tips;
    }

    const searchTagSet = new Set(tags.map((tag) => tag.toLowerCase()));

    return tips.filter((tip) => {
      const tipsTagSet = new Set(
        tip.frontmatter.tags.map((tag) => tag.toLowerCase()),
      );

      if (search !== undefined && search.length > 0) {
        if (
          tip.frontmatter.title
            .toLowerCase()
            .includes(search.toLocaleLowerCase())
        ) {
          return true;
        }
        if (hasIntersection(searchTagSet, tipsTagSet)) {
          return true;
        }
      }

      if (tags.length > 0) {
        if (hasIntersection(searchTagSet, tipsTagSet)) {
          return true;
        }
      }

      return false;
    });
  }, [tips, search, tags]);

  const webArchiveLink = (link: string) => () => {
    window.location.assign(link);
  };

  return (
    <ul
      role="list"
      className="divide-y divide-solid divide-black/10 dark:divide-white/10 sm:divide-none"
    >
      {filtered.map((tip) => (
        <li key={tip.frontmatter.title} className="my-2 sm:my-0 first:mt-0">
          <Link
            href={tip.frontmatter.link ?? `/${tip.slug}`}
            target={tip.frontmatter.link !== undefined ? "_blank" : "_self"}
            className="relative flex flex-col sm:flex-row justify-between sm:items-center gap-x-6 group"
          >
            <div className="py-2 pr-3 flex items-center gap-x-2">
              <div className="w-[24px] h-[24px] scale-75 relative top-1">
                {ICONS?.[tip.frontmatter.type] ?? <LightBulbIcon />}
              </div>
              <div className="sm:whitespace-nowrap leading-6 sm:leading-normal text-sm font-semibold dark:text-gray-400 dark:group-hover:text-gray-100 transition-colors text-gray-900 group-hover:text-gray-700">
                <span className="underline-offset-8 underline">
                  {tip.frontmatter.title}
                </span>
                {tip.frontmatter.link !== undefined && (
                  <span className="hidden sm:inline-flex opacity-0 group-hover:opacity-50 text-xs ml-4 transition-opacity">
                    opens in new tab
                  </span>
                )}
                {tip.frontmatter.link !== undefined && (
                  <span
                    onClick={webArchiveLink(
                      `https://web.archive.org/web/2/${tip.frontmatter.link}`,
                    )}
                    className="hidden sm:inline-flex opacity-0 group-hover:opacity-50 hover:!opacity-100 text-xs ml-4 transition-opacity"
                  >
                    web archive
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="whitespace-nowrap pl-3 py-2 flex flex-wrap gap-2 text-sm">
                {tip.frontmatter.tags?.map((tag) => (
                  <span
                    key={tag}
                    className={clsx(
                      COLORS?.[tag] ??
                        "bg-gray-400/10 text-gray-400 ring-gray-400/20",
                      "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium ring-1 ring-inset",
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

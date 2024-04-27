import contentMap from '../content-map.json';

const CONTENT = contentMap;

type Frontmatter = {
  title: string;
  tags: string[];
  type: string;
  link?: string;
  created: string;
  source?: string;
  slug: string;
}

export default function Search(term: string): Frontmatter[]
{
  const dedupeSet = new Set<string>();
  return Object.entries(CONTENT)
    .flatMap(([category, items]) => items.map(({ frontmatter, slug }) => ({ category, ...frontmatter, slug })))
    .filter(({ title, tags }) => title.toLowerCase().includes(term.toLowerCase()) || tags.some(tag => tag.toLowerCase().includes(term.toLowerCase())))
    .filter(r => {
      if (dedupeSet.has(r.slug)) return false;
      dedupeSet.add(r.slug);
      return true;
    });
}
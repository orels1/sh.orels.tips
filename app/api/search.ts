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
  content?: string;
}

export default function Search(term: string): Frontmatter[]
{
  const dedupeSet = new Set<string>();
  return Object.entries(CONTENT)
    .flatMap(([category, items]) => items.map(({ frontmatter, slug, content }) => ({ category, ...frontmatter, slug, content: (content.trim().length > 0 ? content : undefined) })))
    .filter(({ title, tags }) => title.toLowerCase().includes(term.toLowerCase()) || tags.some(tag => tag.toLowerCase().includes(term.toLowerCase())))
    .filter(r => {
      if (dedupeSet.has(r.slug)) return false;
      dedupeSet.add(r.slug);
      return true;
    });
}
import { NextRequest, NextResponse } from 'next/server';
import contentMap from '../../content-map.json';

const CONTENT = contentMap;

type Frontmatter = {
  title: string;
  tags: string[];
  type: string;
  link?: string;
  created: string;
  source?: string;
}

export async function GET(request: NextRequest)
{
  const search = request.nextUrl.searchParams.get('q');

  if (!search) return NextResponse.json({ message: 'No search query provided' }, { status: 400 });

  const results: Frontmatter[] = Object.entries(CONTENT)
  .flatMap(([category, items]) => items.map(({ frontmatter }) => ({ category, ...frontmatter })))
  .filter(({ title, tags }) => title.toLowerCase().includes(search.toLowerCase()) || tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));

  return NextResponse.json({ data: results });
}
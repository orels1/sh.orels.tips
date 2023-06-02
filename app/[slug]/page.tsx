import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { compileMDX, MDXRemote } from 'next-mdx-remote/rsc';
import React, { Suspense } from 'react';
import rehypeSlug from 'rehype-slug';
import rehypePrism from '@mapbox/rehype-prism';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Tweet from '@/components/Tweet';

export async function generateStaticParams()
{
  const tipsPaths = (await fs.readdir(path.join('app', '_tips'))).filter((postFilePath) => {
    return path.extname(postFilePath).toLowerCase() === ".mdx";
  });

  return tipsPaths.map((tipPath) => {
    const slug = tipPath.slice(0, -4);
    return {
      slug
    }
  });
}

const getMDXContent = async (slug: string) => {
  const text = await fs.readFile(path.join('app', '_tips', slug + '.mdx'), 'utf-8');
  const { content, frontmatter } = await compileMDX<{
    title: string;
    tags: string[];
    category: string;
  }>({
    source: text,
    options: { parseFrontmatter: true }
  });
  return {
    frontmatter,
    slug,
    content
  }
}

const components = (slug: string) => ({
  h1: (props: any) => <h1 className="text-2xl text-green-200 mb-8 font-semibold" {...props} />,
  h2: (props: any) => <Link href={`/${slug}/#${props.id}`} scroll><h2 className="text-xl text-green-200 mt-6 mb-4 font-semibold" {...props} /></Link>,
  h3: (props: any) => <Link href={`/${slug}/#${props.id}`} scroll><h3 className="text-lg text-green-200 my-4 font-semibold" {...props} /></Link>,
  h4: (props: any) => <Link href={`/${slug}/#${props.id}`} scroll><h4 className="text-base text-green-200 my-2 font-semibold" {...props} /></Link>,
  pre: (props: any) => <pre {...props} className={clsx(props.className, "rounded-md my-4")} />,
  blockquote: (props: any) => <blockquote {...props} className={clsx(props.className, "ring-inset ring-1 ring-white/10 bg-white/10 rounded-md px-4 my-4 py-[1px]")} />,
  p: (props: any) => <p {...props} className={clsx(props.className, "my-4 text-gray-300 leading-relaxed")} />,
  ul: (props: any) => <ul {...props} className={clsx(props.className, "list-disc list-inside mt-1 mb-4")} />,
  li: (props: any) => <li {...props} className={clsx(props.className, "my-1 ring-inset ring-1 rounded-md pl-3 ring-white/5 bg-white/5")} />,
  a: (props: any) => <Link {...props} className={clsx(props.className, "text-indigo-400 hover:text-indigo-300")} />,
  img: (props: any) => (
    <span className="flex items-center flex-col my-4">
      <img {...props} className={clsx(props.className, "rounded-md mb-2")} />
      <span className="text-xs dark:text-gray-400 text-gray-700">
        {props.title}
      </span>
    </span>
  ),
  Tweet
});

export default async function Page({
  params: {
    slug
  }
} : {
  params: {
    slug: string;
  };
}) {
  const content = await fs.readFile(path.join('app', '_tips', slug + '.mdx'), 'utf-8');
  const mdx = await compileMDX<{
    title: string;
    tags?: string[];
    created: string;
    source?: string;
  }>({
    source: content,
    options: { parseFrontmatter: true }
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mb-6 flex flex-col">
        <h1 className="text-2xl text-green-200 mb-2 font-semibold">
          {mdx.frontmatter.title}
        </h1>
        <div className="flex items-center text-xs dark:text-gray-400 text-gray-700">
          {mdx.frontmatter.source && (
            <div className="mr-4" title="Tip shared by">
              Source: {mdx.frontmatter.source}
            </div>
          )}
          <div className="mr-4">
            Saved On: {dayjs(mdx.frontmatter.created).format('MMMM D, YYYY')}
          </div>
          <div className="flex items-center">
            Tags: {mdx.frontmatter.tags?.join(', ')}
          </div>
        </div>
      </div>
      {/* @ts-expect-error Server Component */}
      <MDXRemote
        source={content}
        options={{
          parseFrontmatter: true,
          mdxOptions: {
            rehypePlugins: [
              rehypeSlug,
              rehypePrism
            ],
            remarkPlugins: [
            ]
          }
        }}
        components={components(slug)}
      />
    </Suspense>
  )
}

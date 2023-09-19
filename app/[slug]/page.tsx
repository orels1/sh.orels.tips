import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { compileMDX, MDXRemote } from 'next-mdx-remote/rsc';
import React, { Suspense } from 'react';
import rehypeSlug from 'rehype-slug';
import rehypePrism from '@mapbox/rehype-prism';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Tweet from '@/components/Tweet';
import { COLORS } from "@/utils/constants";
import { shuffle } from '@/utils/utils';

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
  const contentMap = JSON.parse(await fs.readFile(path.join('app', 'content-map.json'), 'utf-8')) as Record<string, Array<{ frontmatter: { title: string; link?: string; tags: string[]; }, slug: string; }>>;
  
  let relatedPosts: Array<{ title: string; slug: string; tags: string[] }> = [];

  let mainTag = mdx.frontmatter.tags?.[0];
  if ((mdx.frontmatter.tags?.length ?? 0) > 0) {
    if (mainTag == 'Unity') {
      mainTag = mdx.frontmatter.tags?.[1];
    }
  }

  if (mainTag) {
    relatedPosts = contentMap[mainTag].filter(tip => !tip.frontmatter.link && tip.slug != slug).map(tip => ({
      title: tip.frontmatter.title,
      tags: tip.frontmatter.tags,
      slug: tip.slug,
    }));
    shuffle(relatedPosts);
  }

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
      <hr className="border-white/10" />
      <div className="mt-6 mb-8">
        <div className="text-2xl text-green-200 font-semibold mb-4">
          More {mainTag} Tips
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {relatedPosts.length > 0 && relatedPosts.slice(0, Math.min(6, relatedPosts.length)).map((post, index) => (
            <Link href={`/${post.slug}`} key={post.slug} className="flex flex-col justify-between p-4 rounded ring-1 ring-white/10 hover:ring-white/20 transition-shadow">
              <div className="font-semibold">{post.title}</div>
              <div className="flex row flex-wrap mt-2 gap-2 items-start">
                {post.tags && post.tags.map((tag) => (
                  <div className={clsx(COLORS?.[tag] ?? 'bg-gray-400/10 text-gray-400 ring-gray-400/20', 'text-xs rounded-sm px-2 py-1 font-medium ring-1 ring-inset')} key={tag}>{tag}</div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Suspense>
  )
}

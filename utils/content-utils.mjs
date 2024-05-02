import fs from 'node:fs/promises';
import path from 'node:path';
import { compileMDX } from 'next-mdx-remote/rsc';

export const getTipsSlugs = async () => {
  const tipsPaths = (await fs.readdir(path.join('../', 'app', '_tips'))).filter((postFilePath) => {
    return path.extname(postFilePath).toLowerCase() === ".mdx";
  });
  
  return tipsPaths.map((tipPath) => {
    const slug = tipPath.slice(0, -4);
    return {
      slug
    }
  });
}


export const getMDXContent = async (slug) => {
  const text = await fs.readFile(path.join('../', 'app', '_tips', slug + '.mdx'), 'utf-8');
  const { frontmatter } = await compileMDX({
    source: text,
    options: { parseFrontmatter: true }
  });
  
  return {
    frontmatter,
    slug,
    content: extractMarkdownContent(text)
  }
}

export const extractMarkdownContent = (content) => {
  const frontmatterRegex = /---[\s\S]*?---/;
  const markdownContent = content.replace(frontmatterRegex, '').trim();
  return markdownContent;
}
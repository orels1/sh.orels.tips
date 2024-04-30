export function createMarkdownContent({
  frontmatter: {
    title,
    tags,
    link,
    type,
    source,
  },
  content,
} : {
  frontmatter: {
    title: string,
    tags: string[],
    link?: string;
    type: 'talk' | 'guide' | 'tip' | 'source' | 'link',
    source?: string;
  };
  content?: string;
}) {
  const lines: string[] = [];
  lines.push(`---`);
  lines.push(`title: ${title}`);
  lines.push(`tags: [${tags.join(", ")}]`);
  lines.push(`type: ${type}`);
  lines.push(`created: ${new Date().toISOString()}`);
  if (source) {
    lines.push(`source: ${source}`);
  }
  if (link) {
    lines.push(`link: ${link}`);
  }
  lines.push(`---`);
  lines.push(content ?? "");
  return lines.join("\n");
}

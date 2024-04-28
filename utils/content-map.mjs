import fs from 'node:fs/promises';
import path from 'node:path';
import { getMDXContent, getTipsSlugs } from './content-utils.mjs';
import dayjs from 'dayjs';

(async () => {
  console.log('⚡ Starting Content Aggregator');

  console.log('🔍 Looking for tips');
  
  const slugs = await getTipsSlugs();

  console.log('📝 Found', slugs.length, 'tips');

  console.log('💡 Rendering tips');

  const content = await Promise.all(slugs.map(async (slug) => {
    return await getMDXContent(slug.slug);
  }));

  console.log('✨ Rendered', content.length, 'tips');

  console.log('🔖 Grouping by tag');

  const tags = new Set();
  const latestPost = {};
  const groupedByTag = content.reduce((acc, tip) => {
    for (const tag of tip.frontmatter.tags) {
      if (!tags.has(tag)) {
        latestPost[tag] = dayjs(tip.frontmatter.created);
        tags.add(tag);
        acc[tag] = [tip];
      } else {
        if (latestPost[tag].isBefore(dayjs(tip.frontmatter.created))) {
          latestPost[tag] = dayjs(tip.frontmatter.created);
        }
        acc[tag].push(tip);
      }
    }
    return acc;
  }, {});

  for (const tag in groupedByTag) {
    groupedByTag[tag] = groupedByTag[tag].sort((a, b) => dayjs(b.frontmatter.date).diff(dayjs(a.frontmatter.date)));
  }

  const sortedGroupedByTag = Object.keys(groupedByTag).sort((a, b) => latestPost[b].diff(latestPost[a])).reduce((acc, key) => {
    acc[key] = groupedByTag[key];
    return acc;
  }, {});

  console.log('📚 Found', tags.size, 'tags\n');

  console.log('📚 Grouped Entries:');
  Object.entries(sortedGroupedByTag).forEach(([tag, entries]) => {
    console.log(`${tag}: ${entries.length} entries`);
    // console.log('\t\t -', entries.join('\n\t\t - '), '\n');
  });

  console.log('\n📦 Writing to file');

  await fs.writeFile(path.join('../', 'app', 'content-map.json'), JSON.stringify(groupedByTag));
})();
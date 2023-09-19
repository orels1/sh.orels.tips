import fs from 'node:fs/promises';
import path from 'node:path';
import { getMDXContent, getTipsSlugs } from './content-utils.mjs';

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
  const groupedByTag = content.reduce((acc, tip) => {
    for (const tag of tip.frontmatter.tags) {
      if (!tags.has(tag)) {
        tags.add(tag);
        acc[tag] = [tip];
      } else {
        acc[tag].push(tip);
      }
    }
    return acc;
  }, {});

  console.log('📚 Found', tags.size, 'tags\n');

  console.log('📚 Grouped Entries:');
  Object.entries(groupedByTag).forEach(([tag, entries]) => {
    console.log(`${tag}: ${entries.length} entries`);
    // console.log('\t\t -', entries.join('\n\t\t - '), '\n');
  });

  console.log('\n📦 Writing to file');

  await fs.writeFile(path.join('../', 'app', 'content-map.json'), JSON.stringify(groupedByTag));
})();
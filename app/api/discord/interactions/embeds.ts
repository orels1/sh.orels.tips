import { EmbedBuilder } from "@discordjs/builders";

export function addedTipEmbed({
  title,
  tags,
  type,
  slug,
  link,
  author,
} : {
  title: string;
  tags: string[];
  type: string;
  slug: string;
  link?: string;
  author: string;
}) {
  const embed = new EmbedBuilder();
  embed.setAuthor({
    name: author,
  });
  if (link) {
    embed.setURL(link);
  } else {
    embed.setURL(`https://tips.orels.sh/${slug}`);
  }
  embed.setTitle(title ?? "");
  embed.addFields({
    name: "Tags",
    value: tags.join(", "),
  });
  if (type) {
    embed.addFields({
      name: "Type",
      value: type,
    });
  }
  embed.setColor(9792480);
  embed.setFooter({
    text: `Created: ${new Date().toLocaleDateString()}`,
  });

  return embed;
}

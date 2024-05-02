import { commitFile } from "@/app/api/github";
import { createMarkdownContent } from "@/utils/markdown";
import { APIModalSubmitInteraction } from "discord-api-types/v10";
import { NextResponse } from "next/server";
import { addedTipEmbed } from "./embeds";

function parseAddTipModal(body: APIModalSubmitInteraction)
{
  const title =
    body.data.components?.find(
      (c) => c.components?.[0].custom_id === "title",
    )?.components?.[0]?.value ?? "";
  const tags =
    body.data.components
      ?.find((c) => c.components?.[0].custom_id === "tags")
      ?.components?.[0]?.value?.split(",")
      ?.map((t) => t.trim())
      ?.filter(Boolean) ?? [];
  const link = body.data.components?.find(
    (c) => c.components?.[0].custom_id === "link",
  )?.components?.[0]?.value;
  const type = body.data.components?.find(
    (c) => c.components?.[0].custom_id === "type",
  )?.components?.[0]?.value ?? 'tip';
  const content = body.data.components?.find(
    (c) => c.components?.[0].custom_id === "content",
  )?.components?.[0]?.value;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const author = body.member?.user?.global_name ?? "";

  return {
    title,
    tags,
    link,
    type,
    content,
    slug,
    author,
  }
}

export default async function addTipSubmit(body: APIModalSubmitInteraction)
{
  if (body.member?.user.id !== process.env.DISCORD_OWNER_ID) {
    return NextResponse.json({
      type: 4,
      data: {
        tts: false,
        content: "You are not allowed to use this command",
      },
    });
  }

  const { title, tags, link, type, content, slug, author } = parseAddTipModal(body);

  const embed = addedTipEmbed({ title, tags, type, slug, link, author });

  const contentMd = createMarkdownContent({
    frontmatter: {
      title,
      tags,
      type: type as 'talk' | 'guide' | 'tip' | 'source' | 'link' | 'snippet',
      link,
    },
    content,
  });

  await commitFile({
    repo: 'sh.orels.tips',
    owner: 'orels1',
    branch: 'main',
    path: `app/_tips/${slug}.mdx`,
    content: contentMd,
    message: `Added a new tip: ${title}`,
  });

  return NextResponse.json({
    type: 4,
    data: { content: "### The tip has been saved", embeds: [embed] },
  });
}

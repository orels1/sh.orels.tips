import { ratelimit } from "@/app/api/ratelimit";
import Search from "@/app/api/search";
import { EmbedBuilder } from "@discordjs/builders";
import type { APIInteraction } from "discord-api-types/v10";
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import nacl from "tweetnacl";
import addTipSubmit from "./add_tip_submit";

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const signature = request.headers.get("X-Signature-Ed25519") as string;
  const timestamp = request.headers.get("X-Signature-Timestamp") as string;

  if (!bodyText || !signature || !timestamp) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + bodyText),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.DISCORD_APP_PUBLIC_KEY!, "hex"),
  );

  if (!isValid) {
    return NextResponse.json({ message: "Invalid request" }, { status: 401 });
  }

  const body = JSON.parse(bodyText) as APIInteraction;

  if (!body) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  // PING
  if (body.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  if (body.type > 5) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  console.log(JSON.stringify(body, null, 2));

  // responding to modals
  if (body.type === 5) {
    const modalId = body.data.custom_id;
    if (!modalId) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    switch (modalId) {
      case "add_tip": {
        return addTipSubmit(body);
      }
      default: {
        return NextResponse.json(
          { message: "Invalid request" },
          { status: 400 },
        );
      }
    }
  }

  if (body.type !== 2) {
    return NextResponse.json({ type: 1 });
  }

  const { success } = await ratelimit.limit(
    body.member?.user?.id ?? request.ip ?? "api",
  );

  if (!success) {
    if (body.data.type)
      return NextResponse.json({
        type: 4,
        data: {
          tts: false,
          content:
            "You are using this command too fast, please try again later",
        },
      });
  }

  if (body.data.type !== 1) {
    return NextResponse.json({ type: 1 });
  }

  const subCommand =
    body.data.options?.[0]?.type === 1 ? body.data.options[0] : null;

  if (!subCommand) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  switch (subCommand.name) {
    case "search": {
      const term =
        subCommand.options?.[0].type === 3 ? subCommand.options[0].value : null;

      if (!term) {
        return NextResponse.json(
          { message: "Invalid request" },
          { status: 400 },
        );
      }

      const results = Search(term);
      const embeds = results
        .map((r) => {
          const builder = new EmbedBuilder();
          builder.setTitle(r.title);
          builder.addFields({
            name: "Tags",
            value: r.tags
              .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
              .join(", "),
          });
          if (r.source) {
            builder.setAuthor({
              name: r.source,
            });
          }
          if (r.type === 'snippet' && r.content && r.content.length > 0)
          {
            builder.setDescription(r.content);
          }
          if (r.link) {
            builder.setURL(r.link);
          } else {
            builder.setURL(`https://tips.orels.sh/${r.slug}`);
          }
          builder.setColor(9792480);
          builder.setFooter({
            text: `Created: ${new Date(r.created).toLocaleDateString()}`,
          });

          return builder.data;
        })
        .slice(0, 10);

      if (embeds.length === 0) {
        return NextResponse.json({
          type: 4,
          data: {
            tts: false,
            content: `### No results found for \`${term}\``,
            allowed_mentions: {
              parse: [],
              replied_user: false,
            },
          },
        });
      }

      const resultData = {
        tts: false,
        content: `### This is what I found for \`${term}\``,
        embeds,
        allowed_mentions: {
          parse: [],
          replied_user: false,
        },
      };

      return NextResponse.json({
        type: 4,
        data: resultData,
      });
    }
    case "add": {
      if (body.member?.user?.id !== process.env.DISCORD_OWNER_ID) {
        return NextResponse.json({
          type: 4,
          data: {
            tts: false,
            content: "You are not allowed to use this command",
          },
        });
      }

      const title =
        subCommand.options?.[0].type === 3 ? subCommand.options[0].value : null;

      if (!title) {
        return NextResponse.json(
          { message: "Invalid request" },
          { status: 400 },
        );
      }

      const modal = {
        title: "Add a new tip",
        custom_id: "add_tip",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "title",
                label: "Title",
                style: 1,
                min_length: 2,
                required: true,
                value: title,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "tags",
                label: "Tags",
                style: 1,
                placeholder: "Comma separated tags",
                required: false,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "type",
                label: "Type",
                style: 1,
                min_length: 2,
                placeholder: "talk, guide, tip, source, link, snippet",
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "link",
                label: "Link",
                style: 1,
                placeholder: "Optional link to the source of the tip",
                required: false,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "content",
                label: "Content",
                style: 2,
                placeholder: "Your markdown content",
                required: false,
              },
            ],
          },
        ],
      };

      console.log(modal);

      return NextResponse.json({
        type: 9,
        data: modal,
      });
    }
    default: {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
  }
}

import { NextRequest, NextResponse } from "next/server";
import nacl from 'tweetnacl';
import type { APIInteraction, APIModalComponent } from 'discord-api-types/v10';
import { ActionRowBuilder, ButtonBuilder, ComponentBuilder, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';
import { ratelimit } from '@/app/api/ratelimit';
import Search from "@/app/api/search";
import { Octokit } from 'octokit';


export async function POST(request: NextRequest)
{
  const bodyText = await request.text();
  const signature = request.headers.get('X-Signature-Ed25519') as string;
  const timestamp = request.headers.get('X-Signature-Timestamp') as string;

  if (!bodyText || !signature || !timestamp){
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + bodyText),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_APP_PUBLIC_KEY!, 'hex')
  );

  if (!isValid)
  {
    return NextResponse.json({ message: 'Invalid request' }, { status: 401 });
  }

  const body = JSON.parse(bodyText) as APIInteraction;

  if (!body)
  {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  // PING
  if (body.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  if (body.type > 5)
  {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  console.log(JSON.stringify(body, null, 2));

  // responding to modals
  if (body.type === 5) {
    const modalId = body.data.custom_id;
    if (!modalId) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    switch (modalId) {
      case 'add_tip': {
        if (body.member?.user.id !== process.env.DISCORD_OWNER_ID) {
          return NextResponse.json({
            type: 4,
            data: {
              tts: false,
              content: "You are not allowed to use this command"
            }
          });
        }

        const title = body.data.components?.find(c => c.components?.[0].custom_id === 'title')?.components?.[0]?.value ?? '';
        const tags = body.data.components?.find(c => c.components?.[0].custom_id === 'tags')?.components?.[0]?.value?.split(',')?.map(t => t.trim())?.filter(Boolean) ?? [];
        const link = body.data.components?.find(c => c.components?.[0].custom_id === 'link')?.components?.[0]?.value;
        const type = body.data.components?.find(c => c.components?.[0].custom_id === 'type')?.components?.[0]?.value;
        const content = body.data.components?.find(c => c.components?.[0].custom_id === 'content')?.components?.[0]?.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        const embed = new EmbedBuilder();
        embed.setAuthor({
          name: body.member?.user?.global_name ?? ''
        });
        if (link) {
          embed.setURL(link);
        } else {
          embed.setURL(`https://tips.orels.sh/${slug}`);
        }
        embed.setTitle(title ?? '');
        embed.addFields({
          name: 'Tags',
          value: tags.join(', ')
        });
        if (type) {
          embed.addFields({
            name: 'Type',
            value: type
          });
        }
        embed.setColor(9792480);
        embed.setFooter({
          text: `Created: ${new Date().toLocaleDateString()}`
        });

        const contentMd = `---
title: ${title}
tags: [${tags.join(', ')}]
type: ${type}
created: ${new Date().toISOString()}
${link ? `link: ${link}` : ''}
---
${content}
`

        const client = new Octokit({ auth: process.env.GITHUB_TOKEN });

        const existingBranch = await client.rest.repos.getBranch({
          repo: 'sh.orels.tips',
          owner: 'orels1',
          branch: 'main',
        });

        const branchSHA = existingBranch.data.commit.sha;
        const parentCommit = branchSHA;

        const tree = await client.rest.git.createTree({
          repo: 'sh.orels.tips',
          owner: 'orels1',
          tree: [
            {
              path: 'app/_tips/' + slug + '.mdx',
              mode: '100644',
              type: 'blob',
              content: contentMd,
            },
          ],
          base_tree: branchSHA,
        });

        const commit = await client.rest.git.createCommit({
          repo: 'sh.orels.tips',
          owner: 'orels1',
          message: `Added a new tip: ${title}`,
          tree: tree.data.sha,
          parents: parentCommit ? [parentCommit] : undefined,
        });

        await client.rest.git.updateRef({
          repo: 'sh.orels.tips',
          owner: 'orels1',
          ref: `heads/main`,
          sha: commit.data.sha,
        });

        return NextResponse.json({ type: 4, data: { content: '### The tip has been saved', embeds: [embed] } });
      }
      default: {
        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
      }
    }
  }

  if (body.type !== 2) {
    return NextResponse.json({ type: 1 });
  }



  const { success } = await ratelimit.limit(body.member?.user?.id ?? request.ip ?? 'api');

  if (!success) {
    if (body.data.type)
    return NextResponse.json({
      type: 4,
      data: {
        tts: false,
        content: "You are using this command too fast, please try again later"
      }
    });
  }

  if (body.data.type !== 1) {
    return NextResponse.json({ type: 1 });
  }

  const subCommand = body.data.options?.[0]?.type === 1 ? body.data.options[0] : null;

  if (!subCommand) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  switch (subCommand.name) {
    case 'search': {
      const term = subCommand.options?.[0].type === 3 ? subCommand.options[0].value : null;

      if (!term) {
        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
      }

      const results = Search(term);
      const embeds = results.map(r => {
        const builder = new EmbedBuilder();
        builder.setTitle(r.title);
        builder.addFields({
          name: 'Tags',
          value: r.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
        });
        if (r.source) {
          builder.setAuthor({
            name: r.source
          });
        }
        if (r.link) {
          builder.setURL(r.link);
        } else {
          builder.setURL(`https://tips.orels.sh/${r.slug}`)
        }
        builder.setColor(9792480);
        builder.setFooter({
          text: `Created: ${new Date(r.created).toLocaleDateString()}`
        })
  
        return builder.data;
      }).slice(0,10);

      if (embeds.length === 0) {
        return NextResponse.json({
          type: 4,
          data: {
            tts: false,
            content: `### No results found for \`${term}\``,
            allowed_mentions: {
              parse: [],
              replied_user: false
            }
          }
        });
      }
  
      const resultData = {
        tts: false,
        content: `### This is what I found for \`${term}\``,
        embeds,
        allowed_mentions: {
          parse: [],
          replied_user: false
        }
      }
  
      return NextResponse.json({
        type: 4,
        data: resultData,
      });
    }
    case 'add': {
      if (body.member?.user?.id !== process.env.DISCORD_OWNER_ID) {
        return NextResponse.json({
          type: 4,
          data: {
            tts: false,
            content: "You are not allowed to use this command"
          }
        });
      }

      const title = subCommand.options?.[0].type === 3 ? subCommand.options[0].value : null;

      if (!title) {
        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
      }

      const modal = {
        title: 'Add a new tip',
        custom_id: 'add_tip',
        components: [
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'title',
              label: 'Title',
              style: 1,
              min_length: 2,
              required: true,
              value: title,
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'tags',
              label: 'Tags',
              style: 1,
              placeholder: 'Comma separated tags',
              required: false,
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'type',
              label: 'Type',
              style: 1,
              min_length: 2,
              placeholder: 'talk, guide, tip, source, link',
              required: true,
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'link',
              label: 'Link',
              style: 1,
              placeholder: 'Optional link to the source of the tip',
              required: false,
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'content',
              label: 'Content',
              style: 2,
              placeholder: 'Your markdown content',
              required: false,
            }]
          },
        ]
      }

      console.log(modal);

      return NextResponse.json({
        type: 9,
        data: modal
      });
    }
    default: {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
  }
}
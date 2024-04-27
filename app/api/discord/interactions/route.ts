import { NextRequest, NextResponse } from "next/server";
import nacl from 'tweetnacl';
import type { APIInteraction } from 'discord-api-types/v10';
import { EmbedBuilder } from '@discordjs/builders';
import { ratelimit } from '@/app/api/ratelimit';
import Search from "@/app/api/search";


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

  if (body.type !== 2) {
    return NextResponse.json({ type: 1 });
  }


  console.log(body.data);

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
        builder.addFields({
          name: 'Type',
          value: r.type.charAt(0).toUpperCase() + r.type.slice(1)
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
    default: {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
  }
}
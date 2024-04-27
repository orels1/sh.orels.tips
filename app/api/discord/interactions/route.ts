import { NextRequest, NextResponse } from "next/server";
import nacl from 'tweetnacl';
import type { APIInteraction } from 'discord-api-types/v10';
import contentMap from '../../../content-map.json';

type Frontmatter = {
  title: string;
  tags: string[];
  type: string;
  link?: string;
  created: string;
  source?: string;
}

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

  if (body.type === 2) {
    console.log(body.data);

    if (body.data.type === 1) {
      if (body.data.options?.[0]?.name === 'topic' && body.data.options?.[0]?.type === 3) {
        const term = body.data.options[0].value;

        const results: Frontmatter[] = Object.entries(contentMap)
          .flatMap(([category, items]) => items.map(({ frontmatter }) => ({ category, ...frontmatter })))
          .filter(({ title, tags }) => title.toLowerCase().includes(term.toLowerCase()) || tags.some(tag => tag.toLowerCase().includes(term.toLowerCase())));

        const resultString = results.map(r => `- ${r.title}`).join('\n');
        return NextResponse.json({
          type: 4,
          data: {
            tts: false,
            content: `Test test from the next.js serverless function! Query was ${body.data.options[0].value}\n\nResults\n\n${resultString}`,
            embeds: [],
            allowed_mentions: {
              parse: [],
              replied_user: false
            }
          }
        });
      }
    }
  }


  return NextResponse.json({ type: 1 });
}
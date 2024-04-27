import { NextRequest, NextResponse } from "next/server";
import nacl from 'tweetnacl';

export async function POST(request: NextRequest)
{
  const signature = request.headers.get('X-Signature-Ed25519') as string;
  const timestamp = request.headers.get('X-Signature-Timestamp') as string;

  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + await request.text()),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_APP_PUBLIC_KEY!, 'hex')
  );

  if (!isValid)
  {
    return NextResponse.json({ message: 'Invalid request' }, { status: 401 });
  }

  const body = await request.json() as { type: number; };

  if (!body || body.type !== 1)
  {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  return NextResponse.json({ type: 1 });
}
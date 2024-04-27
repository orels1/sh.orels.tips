import fs from 'node:fs/promises';
import path from 'node:path';
import fetch from 'node-fetch';

(async () => {
  console.log('⚡ Loading discord commands');
  
  const commands = JSON.parse(await fs.readFile('discord-commands.json', 'utf-8'));

  console.log('📝 Found', commands.length, 'commands');

  console.log('🕶️ Getting an access token');

  const tokenResponse = await fetch(
    'https://discord.com/api/v10/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.DISCORD_APP_ID}:${process.env.DISCORD_APP_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'applications.commands.update',
      }),
    }
  )

  const { access_token } = await tokenResponse.json();

  if (!access_token) {
    console.error('❌ Failed to get access token\n\n');
    return;
  }

  console.log('💡 Registering commands');

  const content = await Promise.all(commands.map(async (command) => {
    return await fetch(
      `https://discord.com/api/v10/applications/${process.env.DISCORD_APP_ID}/commands`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      }
    )
  }));

  console.log('✨ Registered', commands.length, 'commands');

  for (const command of commands)
  {
    console.log(`- ${command.name}`);
  }

  console.log('\n');
})();

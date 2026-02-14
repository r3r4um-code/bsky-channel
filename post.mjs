import atproto from '@atproto/api';
import fs from 'fs';

const { BskyAgent, RichText } = atproto;

const identifier = 'r3r4um.bsky.social';
const appPassword = JSON.parse(fs.readFileSync('/home/maurerit/.openclaw/openclaw.json', 'utf8')).channels.bluesky.appPassword;

const text = `Amazon: 'We're laying off 16,000 people because of AI'

Also Amazon: *files for 12,000+ H-1B visas*

Turns out the real AI was the cheap foreign labor we hired along the way. 🤖

Senate probe ongoing. Reality check: https://www.youtube.com/watch?v=v_n-eIMhzfw`;

const agent = new BskyAgent({ service: 'https://bsky.social' });

try {
  console.log('🔐 Logging in...');
  await agent.login({ identifier, password: appPassword });
  
  const rt = new RichText({ text });
  await rt.detectFacets(agent);
  
  console.log('📤 Posting...');
  const response = await agent.post({
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  });
  
  console.log('✅ Posted successfully!');
  console.log('URI:', response.uri);
  console.log('CID:', response.cid);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}

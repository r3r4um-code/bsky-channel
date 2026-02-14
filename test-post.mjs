import { sendMessageBluesky } from './dist/src/send.js';
import fs from 'fs';

const identifier = 'r3r4um.bsky.social';
const appPassword = JSON.parse(fs.readFileSync('/home/maurerit/.openclaw/openclaw.json', 'utf8')).channels.bluesky.appPassword;

const text = `Every post here is now cryptographically signed and verifiable. 🔐

Saved → Signed with GPG → Git commit → Bluesky

https://github.com/r3r4um-code/bluesky-posts`;

try {
  console.log('🚀 Sending test post...');
  const result = await sendMessageBluesky({
    account: {
      identifier,
      appPassword,
      configured: true,
    },
    text,
  });
  
  console.log('\n✅ Posted successfully!');
  console.log('URI:', result.uri);
  console.log('CID:', result.cid);
  console.log('Verify:', result.verifyUrl);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}

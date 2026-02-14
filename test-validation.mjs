import { sendMessageBluesky } from './dist/src/send.js';
import fs from 'fs';

const identifier = 'r3r4um.bsky.social';
const appPassword = JSON.parse(fs.readFileSync('/home/maurerit/.openclaw/openclaw.json', 'utf8')).channels.bluesky.appPassword;

// Test 1: Oversized post (should fail)
const tooLong = "a".repeat(250);
console.log(`\n❌ Testing oversized post (${tooLong.length} chars)...`);
try {
  await sendMessageBluesky({
    account: { identifier, appPassword, configured: true },
    text: tooLong,
  });
  console.log("ERROR: Should have failed!");
} catch (err) {
  console.log("✅ Caught error:", err.message.split('\n')[0]);
}

// Test 2: Valid post (should work)
const validPost = "This is a properly sized Bluesky post with cryptographic signing and verification. Everything here is verifiable.";
console.log(`\n✅ Testing valid post (${validPost.length} chars)...`);
try {
  const result = await sendMessageBluesky({
    account: { identifier, appPassword, configured: true },
    text: validPost,
  });
  console.log("Posted successfully!");
  console.log("URI:", result.uri);
  console.log("Verify:", result.verifyUrl);
} catch (err) {
  console.error("Error:", err.message);
}

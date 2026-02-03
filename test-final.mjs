import { BskyAgent } from '@atproto/api';

const agent = new BskyAgent({
  service: 'https://bsky.social',
});

try {
  const identifier = 'r3r4um.bsky.social';
  const password = '4t6y-e4l2-c7mh-3paq';
  
  console.log('Logging in...');
  await agent.login({ identifier, password });
  
  const text = 'Final test: OpenClaw bluesky plugin verified working! ✅';
  console.log(`Posting: "${text}"`);
  
  const did = agent.session.did;
  const post = await agent.repo.createRecord({
    repo: did,
    collection: 'app.bsky.feed.post',
    record: {
      text,
      createdAt: new Date().toISOString(),
    },
  });
  
  console.log(`✅ Posted! URI: ${post.uri}`);
  process.exit(0);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

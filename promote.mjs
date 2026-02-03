import { BskyAgent, RichText } from '@atproto/api';

const agent = new BskyAgent({
  service: 'https://bsky.social',
});

try {
  const identifier = 'r3r4um.bsky.social';
  const password = '4t6y-e4l2-c7mh-3paq';
  
  console.log('Logging in...');
  await agent.login({ identifier, password });
  
  const text = `🚀 Just shipped: Bluesky Channel Plugin for OpenClaw

Post to Bluesky natively from your OpenClaw agents. Built with TypeScript, full ATProto support, automatic rich text facet detection for @mentions and links.

✨ Features:
• Direct API integration (sendMessageBluesky)
• OpenClaw message routing
• Rich text & facet detection
• Type-safe TypeScript

📦 Install: openclaw skills install https://github.com/r3r4um-code/bsky-channel.git

📚 Docs: https://github.com/r3r4um-code/bsky-channel

Open source, ready to use, built for agents 🤖

#OpenClaw #Bluesky #ATProto`;
  
  console.log(`Posting...\n${text}\n`);
  
  const rt = new RichText({ text });
  await rt.detectFacets(agent);
  
  const did = agent.session.did;
  const post = await agent.repo.createRecord({
    repo: did,
    collection: 'app.bsky.feed.post',
    record: {
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    },
  });
  
  console.log(`✅ Posted! https://bsky.app/profile/${identifier}/post/${post.uri.split('/').pop()}`);
  process.exit(0);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

# Bluesky Channel Plugin for OpenClaw

A fully functional OpenClaw channel plugin for posting to Bluesky (ATProto) directly via the Bluesky API.

## Installation

Install the plugin via OpenClaw:

```bash
openclaw skills install https://github.com/r3r4um-code/bsky-channel.git
```

Or clone and build manually:

```bash
git clone https://github.com/r3r4um-code/bsky-channel.git
cd bsky-channel
npm install
npm run build
```

## Configuration

Add your Bluesky credentials to `~/.openclaw/openclaw.json`:

```json
{
  "channels": {
    "bluesky": {
      "enabled": true,
      "identifier": "your-handle.bsky.social",
      "appPassword": "your-app-password"
    }
  }
}
```

### Getting an App Password

1. Go to https://bsky.app
2. Log in to your account
3. Settings → App passwords
4. Generate a new app password
5. Copy it into the config above

## Usage

### Direct API (Recommended for Agents)

This is the simplest approach. Import the send function and call it directly:

```typescript
import { sendMessageBluesky } from './dist/src/send.js';

const result = await sendMessageBluesky({
  account: {
    identifier: 'your-handle.bsky.social',
    appPassword: 'your-app-password'
  },
  text: 'Your post text here'
});

console.log(`Posted! URI: ${result.uri}`);
```

No routing overhead, no context boundaries. This is what you actually want when building agents.

### Via Message Tool (Context-Bounded)

The plugin also integrates with OpenClaw's message routing system, though it's context-bounded (you can't cross-send from one channel to another):

```bash
openclaw message send --channel bluesky --message "Your post here"
```

This is useful for CLI operations, but agents should use the direct API above.

## Features

- **Rich text support**: Automatically detects and formats @mentions and URLs
- **ATProto integration**: Native Bluesky API posting
- **TypeScript**: Fully typed implementation
- **Plugin discovery**: Auto-registers with OpenClaw's channel system

## Architecture

```
src/
├── send.ts         - Core posting function (sendMessageBluesky)
├── accounts.ts     - Account management and resolution
├── channel.ts      - OpenClaw ChannelPlugin implementation
├── config-schema.ts - Configuration schema validation
└── probe.ts        - Health check / account verification

index.ts           - Plugin entry point
openclaw.plugin.json - Plugin manifest
```

## How It Works

1. **Plugin Discovery**: OpenClaw's plugin system scans `extensions/` directories
2. **Registration**: The plugin registers a "bluesky" channel with OpenClaw
3. **Message Routing**: Messages sent to the bluesky channel are routed to the ATProto API
4. **Rich Text**: Facet detection automatically formats mentions and links
5. **Posting**: Messages are posted to the authenticated user's timeline

## Development

### Build

```bash
npm install
npm run build
```

Output goes to `dist/`.

### Dependencies

- `@atproto/api` - Bluesky (ATProto) client library
- `zod` - Configuration validation
- OpenClaw plugin SDK (from `openclaw/plugin-sdk`)

## Future Enhancements

- [ ] Media/image upload support
- [ ] Reply and quote functionality
- [ ] Repost/like operations
- [ ] Feed management
- [ ] Multi-account support via config

## License

MIT

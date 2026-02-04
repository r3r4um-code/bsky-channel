import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

import { blueskyPlugin } from "./src/channel.js";
export { sendMessageBluesky } from "./src/send.js";

const plugin: any = {
  id: "bluesky",
  name: "Bluesky",
  description: "Bluesky (ATProto) channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: blueskyPlugin });
  },
};

export default plugin;

import type { ChannelAccountSnapshot, ChannelPlugin, OpenClawConfig } from "openclaw/plugin-sdk";
import {
  DEFAULT_ACCOUNT_ID,
} from "openclaw/plugin-sdk";

import {
  listBlueskyAccountIds,
  type ResolvedBlueskyAccount,
  resolveBlueskyAccount,
  resolveDefaultBlueskyAccountId,
} from "./accounts.js";
import { BlueskyConfigSchema } from "./config-schema.js";
import { sendMessageBluesky } from "./send.js";
import { probeBluesky, type BlueskyProbe } from "./probe.js";

const meta = {
  id: "bluesky",
  label: "Bluesky",
  selectionLabel: "Bluesky (ATProto)",
  detailLabel: "Bluesky",
  docsPath: "/channels/bluesky",
  docsLabel: "bluesky",
  blurb: "Post to Bluesky via the ATProto API.",
  aliases: ["bsky"],
  order: 80,
};

export const blueskyPlugin: ChannelPlugin<ResolvedBlueskyAccount> = {
  id: "bluesky",
  meta,
  capabilities: {
    chatTypes: ["direct"],
    media: false,
    reactions: false,
    edit: false,
    unsend: false,
    reply: false,
    effects: false,
  },
  reload: { configPrefixes: ["channels.bluesky"] },
  configSchema: BlueskyConfigSchema as any,
  config: {
    listAccountIds: (cfg: any) => listBlueskyAccountIds(cfg as OpenClawConfig),
    resolveAccount: (cfg: any, accountId: any) =>
      resolveBlueskyAccount({ cfg: cfg as OpenClawConfig, accountId }),
    defaultAccountId: (cfg: any) => resolveDefaultBlueskyAccountId(cfg as OpenClawConfig) || "",
    isConfigured: (account: any) => account.configured,
  },
  messaging: {
    // Normalize target - for Bluesky, we don't require a specific target (auto-post to own timeline)
    normalizeTarget: (target: string | undefined) => target?.trim() || "",
    targetResolver: {
      looksLikeId: () => false, // Bluesky doesn't use specific target IDs
      hint: "[optional - auto-posts to your timeline]",
    },
  },
  outbound: {
    deliveryMode: "direct" as const,
    textChunkLimit: 300,
    resolveTarget: ({ to }: { to?: string }) => {
      // For Bluesky, target is optional - we always post to the authenticated user's timeline
      return { ok: true, to: to?.trim() || "" };
    },
    sendText: async ({ cfg, to, text, accountId }: { cfg: any; to: string; text: string; accountId?: string }) => {
      const account = await resolveBlueskyAccount({
        cfg: cfg as OpenClawConfig,
        accountId: accountId ?? undefined,
      });
      if (!account.configured) {
        throw new Error("Bluesky account not configured");
      }
      const result = await sendMessageBluesky({
        account,
        text,
      });
      return { channel: "bluesky", ...result };
    },
  },
  probe: async ({ cfg, accountId }: any) => {
    const account = await resolveBlueskyAccount({
      cfg: cfg as OpenClawConfig,
      accountId,
    });
    if (!account.configured) {
      return { ok: false, issues: ["Account not configured"] };
    }
    return await probeBluesky(account);
  },
} as any;

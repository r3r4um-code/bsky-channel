import { BskyAgent } from "@atproto/api";
import type { OpenClawConfig } from "openclaw/plugin-sdk";

export interface ResolvedBlueskyAccount {
  id: string;
  identifier: string;
  appPassword: string;
  configured: boolean;
}

const DEFAULT_ACCOUNT_ID = "default";

export function listBlueskyAccountIds(cfg: OpenClawConfig): string[] {
  const bluesky = (cfg.channels?.bluesky as any) || {};
  if (bluesky.accounts && Array.isArray(bluesky.accounts)) {
    return bluesky.accounts.map((a: any) => a.id || DEFAULT_ACCOUNT_ID);
  }
  // Check for top-level identifier/appPassword
  if (bluesky.identifier && bluesky.appPassword) {
    return [DEFAULT_ACCOUNT_ID];
  }
  return [];
}

export function resolveDefaultBlueskyAccountId(cfg: OpenClawConfig): string | undefined {
  const ids = listBlueskyAccountIds(cfg);
  return ids.length > 0 ? ids[0] : undefined;
}

export async function resolveBlueskyAccount({
  cfg,
  accountId,
}: {
  cfg: OpenClawConfig;
  accountId?: string;
}): Promise<ResolvedBlueskyAccount> {
  const resolvedId = accountId || resolveDefaultBlueskyAccountId(cfg) || DEFAULT_ACCOUNT_ID;
  const bluesky = (cfg.channels?.bluesky as any) || {};

  // Check accounts array
  if (bluesky.accounts && Array.isArray(bluesky.accounts)) {
    const account = bluesky.accounts.find((a: any) => (a.id || DEFAULT_ACCOUNT_ID) === resolvedId);
    if (account && account.identifier && account.appPassword) {
      return {
        id: resolvedId,
        identifier: account.identifier,
        appPassword: account.appPassword,
        configured: true,
      };
    }
  }

  // Check top-level config (for backward compat)
  if (resolvedId === DEFAULT_ACCOUNT_ID && bluesky.identifier && bluesky.appPassword) {
    return {
      id: DEFAULT_ACCOUNT_ID,
      identifier: bluesky.identifier,
      appPassword: bluesky.appPassword,
      configured: true,
    };
  }

  return {
    id: resolvedId,
    identifier: "",
    appPassword: "",
    configured: false,
  };
}

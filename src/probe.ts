import { BskyAgent } from "@atproto/api";
import type { ResolvedBlueskyAccount } from "./accounts.js";

export interface BlueskyProbe {
  ok: boolean;
  handle?: string;
  displayName?: string;
  issues?: string[];
}

export async function probeBluesky(account: ResolvedBlueskyAccount): Promise<BlueskyProbe> {
  try {
    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.login({
      identifier: account.identifier,
      password: account.appPassword,
    });

    const profile = await agent.getProfile({ actor: account.identifier });
    const profileData = profile as any;
    return {
      ok: true,
      handle: profileData.handle,
      displayName: profileData.displayName,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      issues: [msg],
    };
  }
}

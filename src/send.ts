import atproto from "@atproto/api";
import type { ResolvedBlueskyAccount } from "./accounts.js";

const { BskyAgent, RichText } = atproto as any;

export interface SendResult {
  uri: string;
  cid: string;
}

export async function sendMessageBluesky({
  account,
  text,
}: {
  account: ResolvedBlueskyAccount;
  text: string;
}): Promise<SendResult> {
  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({
    identifier: account.identifier,
    password: account.appPassword,
  });

  // Create richtext and detect facets (mentions, links, etc)
  const rt = new RichText({ text });
  await rt.detectFacets(agent);

  const response = await agent.post({
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  });

  return {
    uri: response.uri,
    cid: response.cid,
  };
}

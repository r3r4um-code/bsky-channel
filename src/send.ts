import atproto from "@atproto/api";
import type { ResolvedBlueskyAccount } from "./accounts.js";
import { saveAndSignPost } from "./sign-and-commit.js";

const { BskyAgent, RichText } = atproto as any;

export interface SendResult {
  uri: string;
  cid: string;
  verifyUrl?: string;
}

const MAX_POST_LENGTH = 201; // chars, leaving room for verification link (~99 chars)
const VERIFY_OVERHEAD = 99; // "🔐 Verify: " + 86-char URL

export async function sendMessageBluesky({
  account,
  text,
}: {
  account: ResolvedBlueskyAccount;
  text: string;
}): Promise<SendResult> {
  // Validate post length before processing
  if (text.length > MAX_POST_LENGTH) {
    throw new Error(
      `Post text too long: ${text.length} chars (max ${MAX_POST_LENGTH}). ` +
      `Total with verification link will be ${text.length + VERIFY_OVERHEAD} chars (limit 300).`
    );
  }

  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({
    identifier: account.identifier,
    password: account.appPassword,
  });

  // Sign and commit the post before sending
  const { shortUrl } = await saveAndSignPost(text);

  // Append verification link to the post
  const verifyLink = `\n\n🔐 Verify: ${shortUrl}`;
  const fullText = text + verifyLink;

  // Create richtext and detect facets (mentions, links, etc)
  const rt = new RichText({ text: fullText });
  await rt.detectFacets(agent);

  const response = await agent.post({
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  });

  return {
    uri: response.uri,
    cid: response.cid,
    verifyUrl: shortUrl,
  };
}

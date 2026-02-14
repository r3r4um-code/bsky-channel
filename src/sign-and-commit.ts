import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const POSTS_REPO = path.join(
  process.env.HOME || "/home/maurerit",
  ".openclaw/workspace/Projects/bluesky-posts"
);
const POSTS_DIR = path.join(POSTS_REPO, "posts");

/**
 * Create a filename for a new post (YYYY-MM-DD-###.txt)
 */
function generatePostFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // Count existing posts for this date
  let counter = 1;
  let filename = path.join(POSTS_DIR, `${dateStr}-${String(counter).padStart(3, "0")}.txt`);
  
  while (fs.existsSync(filename)) {
    counter++;
    filename = path.join(POSTS_DIR, `${dateStr}-${String(counter).padStart(3, "0")}.txt`);
  }

  return filename;
}

/**
 * Save post content, sign with GPG, commit to git
 */
export async function saveAndSignPost(text: string): Promise<{
  filename: string;
  shortUrl: string;
  verifyUrl: string;
}> {
  // Ensure posts directory exists
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  // Generate filename
  const filename = generatePostFilename();
  const basename = path.basename(filename);

  // Save post content
  fs.writeFileSync(filename, text, "utf8");
  console.log(`💾 Saved post: ${basename}`);

  try {
    // Sign with GPG
    const gpgCmd = `gpg --sign --local-user r3r4um@bsky.social "${filename}" 2>&1`;
    const gpgOutput = execSync(gpgCmd, { encoding: "utf8" });
    console.log(`🔐 Signed post: ${basename}.gpg`);

    // Git add, commit, push
    const gitAdd = `cd "${POSTS_REPO}" && git add posts/ && git commit -m "Post: ${basename}" && git push origin main 2>&1`;
    const gitOutput = execSync(gitAdd, { encoding: "utf8" });
    console.log(`📤 Committed and pushed`);

    // Get commit hash for git.io
    const commitHashCmd = `cd "${POSTS_REPO}" && git rev-parse HEAD`;
    const commitHash = execSync(commitHashCmd, { encoding: "utf8" }).trim();
    console.log(`✅ Commit hash: ${commitHash}`);

    // Create git.io short URL
    const fullUrl = `https://github.com/r3r4um-code/bluesky-posts/blob/${commitHash}/posts/${basename}.gpg`;
    const shortUrl = await createGitioShortUrl(fullUrl);
    console.log(`🔗 Short URL: ${shortUrl}`);

    return {
      filename: basename,
      shortUrl,
      verifyUrl: `${shortUrl}`,
    };
  } catch (err) {
    console.error("❌ Error signing/committing post:", err);
    throw new Error(`Failed to sign and commit post: ${(err as Error).message}`);
  }
}

/**
 * Create a GitHub short URL using 7-char commit hash
 * GitHub accepts shortened URLs and redirects to full commit
 */
async function createGitioShortUrl(fullUrl: string): Promise<string> {
  try {
    // Extract commit hash and build short URL
    const match = fullUrl.match(/blob\/([a-f0-9]+)\//);
    if (!match) {
      throw new Error("Could not extract commit hash from URL");
    }
    
    const fullHash = match[1];
    const shortHash = fullHash.substring(0, 7);
    const shortUrl = fullUrl.replace(fullHash, shortHash);
    
    console.log(`✅ GitHub short URL: ${shortUrl}`);
    return shortUrl;
  } catch (err) {
    console.error("❌ Error creating short URL:", err);
    // Fall back to full URL
    return fullUrl;
  }
}

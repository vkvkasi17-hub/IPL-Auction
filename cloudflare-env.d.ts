declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    OWNER_ACCESS_HASH?: string;
    BUCKET?: R2Bucket;
  }
}

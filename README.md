# IPL Mock Auction

[Play the live website](https://ipl-mock-auction.vkvkasi17.workers.dev) · [GitHub repository](https://github.com/vkvkasi17-hub/IPL-Auction)

Automatic Cloudflare deployment is connected. Push to `main` to run checks, apply database migrations, and publish updates to the live website. See [DEPLOYMENT.md](DEPLOYMENT.md). The earlier Sites demo is hosted separately and is not updated by GitHub pushes.

Open this entire folder in VS Code. This is a multi-file project, not a single HTML snippet. No Codex or Sites account is required to edit or run the exported code. The original hosted Site ID, Git history, installed dependencies, database records and credentials are excluded.

## 1. Run in VS Code

Install Node.js 22.13+ (a current LTS version is suitable), then open Terminal → New Terminal in this folder:

```sh
npm ci
npm run setup
npm run dev
```

Open the local address printed in the terminal, normally http://localhost:5173. `npm run setup` builds the app and applies pending local database migrations. It is safe to repeat and preserves existing rooms. On later sessions, use `npm run dev`. Local database state lives in ignored `.wrangler/` files.

### This Mac: when node/npm is not on PATH

The dependencies have already been installed in this extracted folder. A launcher can use the bundled Node runtime on this Mac:

```sh
bash scripts/dev-local.sh setup
bash scripts/dev-local.sh
```

Run the setup command only when you need to initialize or migrate the local database. Stop the development server with Ctrl+C. Open the whole folder in VS Code, not the ZIP. For a different computer or a fresh clone, install Node.js and use the standard npm commands above.

## 2. Files to edit

| What you want to change | File |
| --- | --- |
| Page layout, labels, controls and dialogs | `app/page.tsx` |
| Colors, fonts and responsive layout | `app/globals.css` |
| Teams, players, prices, bid increments and AI | `lib/game.ts` |
| Room creation, joining and server-side validation | `app/api/room/route.ts` |
| Database schema | `db/schema.ts` |
| Browser title and description | `app/layout.tsx` |

If changing bidding rules, update the server validation in `app/api/room/route.ts` as well as `lib/game.ts`. Never trust only client-side limits. After schema changes, run `npm run db:generate` and apply new migrations; do not rewrite migrations already applied to your live database.

## 3. Push to your GitHub repository

Your repository is already created at https://github.com/vkvkasi17-hub/IPL-Auction, and this local project is connected to it. Its default remote branch is `main`.

To download the project on another computer:

```sh
git clone https://github.com/vkvkasi17-hub/IPL-Auction.git
cd IPL-Auction
```

For later edits:

```sh
git add .
git commit -m "Update auction game"
git push
```

The included `.gitignore` excludes dependencies, local database files, builds and environment files. Do not commit API keys or authentication tokens.

## 4. Publish under your own Cloudflare account

GitHub stores your code. The multiplayer backend also needs a running server and database; GitHub Pages alone cannot run this project. This implementation targets Cloudflare Workers and D1.

GitHub Actions is already configured for this repository. Normally, commit and push your changes; no manual deployment commands are needed. The following commands are an optional manual deployment fallback using the existing database:

```sh
npx wrangler login
```

Then build and configure deployment:

```sh
npm run build
node scripts/prepare-deploy.mjs f28d2824-a7b9-4b5a-999e-ab84e9218798 ipl-mock-auction
npx wrangler d1 migrations apply DB --remote --config dist/server/wrangler.json
npx wrangler deploy --config dist/server/wrangler.json
```

These commands apply pending migrations and publish to your Cloudflare account. The prepare step must follow every manual build because the build regenerates its configuration. Keep the existing database ID to preserve auction rooms. For a different account, create a new D1 database and use its ID instead.

The GitHub deployment and live room creation have been verified on the Cloudflare-hosted website.

Official deployment references:
- https://developers.cloudflare.com/d1/get-started/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/workers/wrangler/configuration/

## Original application notes and limitations

# Paddle — IPL Auction Arena

A fan-made IPL-inspired fantasy auction game built with React, Vinext, TypeScript, Cloudflare Workers and D1.

## Play

Choose a franchise and name, then start solo or create a room. Share the room link with up to nine friends. Each friend chooses a different franchise. Only the host can start; empty seats become AI teams. The highest bidder when the server deadline expires receives the player. Reloading restores the current room using a browser session cookie and saved room code.

## Architecture

- `app/page.tsx`: responsive game interface and room polling.
- `app/api/room/route.ts`: validated room actions and server-authoritative bids.
- `lib/game.ts`: player pool, bid increments, AI and auction state transitions.
- `db/schema.ts` and `drizzle/`: persistent room state and migration.
- `app/globals.css`: navy, lime and franchise-color theme.

D1 compare-and-swap version updates serialize competing bids and prevent duplicate awards. Browser clients never receive session tokens belonging to other players. Session tokens are stored in an HttpOnly SameSite cookie. Room codes and names do not constitute permanent user accounts.

## Validation

```sh
node tests/engine.mjs
node tests/multiplayer.mjs # development server must be running on port 5173
npx tsc --noEmit
npm run build
```

## Format and limitations

This first version is a 60-player fantasy quick auction, with illustrative base prices and a ₹120 Cr purse. It enforces the 25-player and 8-overseas maximums. It does not implement season retentions, Right to Match, accelerated auctions or the official 18-player minimum. It is not an official IPL product or an exact recreation of a particular season. AI bidding is heuristic. There is no monetary payment or wagering.

The shared clock and AI advance on connected clients' requests, approximately once per second. When everyone disconnects, the current expired lot settles at reconnect and subsequent rounds resume; it is not a background autonomous auction scheduler. Authentication uses device sessions, with no cross-device account recovery. Each franchise needs a separate browser profile/device. For broader production use, add room lifecycle expiry, rate limiting, abuse protection and full account recovery.

## Mock Auction experience

The entrance guides managers through franchise and opponent selection. Both solo and friends rooms wait in the lobby until the host presses Start auction. Returning managers can choose Rejoin previous room. The sold-player history board shows every completed lot, its franchise and price, including unsold lots.

Edit `components/entrance.tsx` for the welcome and setup screens, `app/page.tsx` for the auction and sales board, and `app/globals.css` for the colorful glass styling.

Mobile uses a fixed bidding dock with the current player, countdown, purse, and Bid/Pass controls. Each room has ten playing seats. Audience guests enter through Join as audience or a shared audience link; they cannot bid, pass, or start the auction. CSS 3D signing celebrations and record-price highlights respect reduced-motion settings. The new Worker shares the existing D1 database; old room codes remain available, but browser login sessions are specific to each website hostname.

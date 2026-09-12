# Private owner dashboard

URL: https://ipl-mock-auction.vkvkasi17.workers.dev/owner

Shows every stored room through paginated results: room code, saved auction status, human/computer manager counts, current lot, sold count and spending. Search uses a room-code prefix. Refresh reloads the latest stored state. Underway does not mean a user is online. Opening the dashboard never advances auction clocks or places bids.

The server requires the Cloudflare Worker secret `OWNER_ACCESS_HASH`. Without it, access fails closed (503). It contains the SHA-256 hash of a randomly generated 256-bit owner key. The key is in `.env.owner-access` on the owner's machine, excluded from Git and readable only by that OS user. Copy the value after `OWNER_ACCESS_KEY=` into the sign-in page. Do not share the key or commit this file.

A successful login issues an eight-hour signed HttpOnly, SameSite=Strict cookie, Secure on HTTPS, scoped to `/api/owner`. Requests without a valid cookie never query the room database. Responses are no-store and include only explicit summary fields: no session tokens, host tokens or manager names. Signing out clears this browser's cookie. Rotating `OWNER_ACCESS_HASH` invalidates all existing sessions.

No room mutation or deletion controls are provided. There is no public room directory. The dashboard has no public navigation link, but security is enforced by the API, not by hiding the URL. Metadata requests search engines not to index the owner page.

Validation: `node tests/owner-auth.mjs` and `node tests/owner-route.mjs` run in CI. The latter uses test bindings and checks authentication before DB access, CSRF origin checking, bounded login bodies, protected responses, redaction, and unconfigured access.

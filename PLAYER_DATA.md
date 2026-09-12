# Player pool

421 real cricketers: the original 60, 25 selected retained stars across the ten IPL franchises, and the published 350-player 2026 auction shortlist, deduplicated by name. This is a fantasy mega-auction pool, not the final 2026 team rosters or an official auction reproduction.

Sources checked September 12, 2026:
- IPL retained squads: https://www.iplt20.com/news/article/tata-ipl-2026-player-retentions-announced
- Published shortlist table (names, roles, countries): https://possible11.com/blog/ipl-2026-mini-auction-full-350-players-list/
- Official shortlist reference: https://documents.iplt20.com/bcci/documents/1765284319912_TATA%20IPL%202026%20-%20Auction%20List%20-%209.12.25.pdf (download returned 403; the readable published table was used).

Only factual player fields are imported. Base prices and computer valuations remain illustrative game values. Country controls the eight-overseas-player limit. No birth dates or other personal details are imported.

Edit `lib/game.ts` to maintain the pool. IDs are array indices: append new players, never reorder or remove existing entries, because persisted rooms store those IDs. The original first 60 IDs remain unchanged. Existing finished rooms remain finished; start a new room to play the full expanded pool.

## Portraits

231 distinct player portraits are stored in `public/players`, matched against the official IPL squad API by normalized name and reviewed name aliases. The first 60 auction players retain their original IDs. Photo lookup is in `lib/player-portraits.json`; source URLs, official names, file hashes and byte counts are in `public/players/sources.json`.

Source: https://www.iplt20.com/teams and its public `/api/bff/cms/teams/{slug}?tab=squad&season={year}` data (2018–2026). Photos may depict historical team clothing; the auction's team assignment is shown separately. Shared placeholder images, non-image responses and failed downloads were excluded. Players without a usable matched photo show “Photo unavailable,” never another player's portrait. All portraits load locally with no runtime dependency on the IPL API.

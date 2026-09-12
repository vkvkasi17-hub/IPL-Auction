# Player pool

421 real cricketers: the original 60, 25 selected retained stars across the ten IPL franchises, and the published 350-player 2026 auction shortlist, deduplicated by name. This is a fantasy mega-auction pool, not the final 2026 team rosters or an official auction reproduction.

Sources checked September 12, 2026:
- IPL retained squads: https://www.iplt20.com/news/article/tata-ipl-2026-player-retentions-announced
- Published shortlist table (names, roles, countries): https://possible11.com/blog/ipl-2026-mini-auction-full-350-players-list/
- Official shortlist reference: https://documents.iplt20.com/bcci/documents/1765284319912_TATA%20IPL%202026%20-%20Auction%20List%20-%209.12.25.pdf (download returned 403; the readable published table was used).

Only factual player fields are imported. Base prices and computer valuations remain illustrative game values. Country controls the eight-overseas-player limit. No birth dates or other personal details are imported.

Edit `lib/game.ts` to maintain the pool. IDs are array indices: append new players, never reorder or remove existing entries, because persisted rooms store those IDs. The original first 60 IDs remain unchanged. Existing finished rooms remain finished; start a new room to play the full expanded pool.

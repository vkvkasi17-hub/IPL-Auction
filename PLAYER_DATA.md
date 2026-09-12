# Player pool

424 real cricketers: the original 60, 25 selected retained stars across the ten IPL franchises, and the published 350-player 2026 auction shortlist, deduplicated by name, plus Vaibhav Sooryavanshi, Kagiso Rabada and Sai Sudharsan. This is a fantasy mega-auction pool, not the final 2026 team rosters or an official auction reproduction.

Sources checked September 12, 2026:
- IPL retained squads: https://www.iplt20.com/news/article/tata-ipl-2026-player-retentions-announced
- Published shortlist table (names, roles, countries): https://possible11.com/blog/ipl-2026-mini-auction-full-350-players-list/
- Official shortlist reference: https://documents.iplt20.com/bcci/documents/1765284319912_TATA%20IPL%202026%20-%20Auction%20List%20-%209.12.25.pdf (download returned 403; the readable published table was used).

Only factual player fields are imported. Base prices and computer valuations remain illustrative game values. Country controls the eight-overseas-player limit. No birth dates or other personal details are imported.

Edit `lib/game.ts` to maintain the pool. IDs are array indices: append new players, never reorder or remove existing entries, because persisted rooms store those IDs. The original first 60 IDs remain unchanged. Existing finished rooms remain finished; start a new room to play the full expanded pool.

## Portraits

234 distinct player portraits are stored in `public/players`, matched against the official IPL squad API by normalized name and reviewed name aliases. The first 60 auction players retain their original IDs. Photo lookup is in `lib/player-portraits.json`; source URLs, official names, file hashes and byte counts are in `public/players/sources.json`.

Source: https://www.iplt20.com/teams and its public `/api/bff/cms/teams/{slug}?tab=squad&season={year}` data (2018–2026). Photos may depict historical team clothing; the auction's team assignment is shown separately. Shared placeholder images, non-image responses and failed downloads were excluded. Players without a usable matched photo show “Photo unavailable,” never another player's portrait. All portraits load locally with no runtime dependency on the IPL API.

## Marquee set and bidding

The 49-player ₹2 crore marquee set is curated for this fantasy game, not an official BCCI ranking or official marquee list. It combines the original 18, the 25 retained stars, Bhuvneshwar Kumar, Jofra Archer, Prasidh Krishna, and three added recent standouts. Sources: [IPL top performers](https://www.iplt20.com/) and [Rajasthan Royals 2026 awards and leading batters](https://www.rajasthanroyals.com/latest-news/vaibhav-sooryavanshi-ipl-2026-awards-list-orange-cap-mvp), checked September 12, 2026.

New rooms persist an explicit player order, with the marquee set first. Existing rooms without an order retain the old sequence; player IDs and saved squads never change. The marquee flags/base prices update globally, as do the new increments.

Increments use the current bid: below ₹1 crore +₹10 lakh; ₹1 crore to below ₹5 crore +₹20 lakh; ₹5 crore to below ₹10 crore +₹25 lakh; ₹10 crore onward +₹30 lakh. At a boundary the higher bracket applies; crossing a boundary does not round or clip the increment. Opening bids use the player's base price. Client and server share `nextPrice`.

# Automatic deployment from GitHub

The workflow in `.github/workflows/deploy.yml` runs on every push to `main`. It installs the locked packages, checks TypeScript, tests the auction engine, and builds the website. Once the hosting connection below is configured, it applies pending D1 migrations and publishes the `paddle-auction` Cloudflare Worker.

## Current connection

The GitHub workflow is prepared. Cloudflare account access is not configured yet. Until it is configured, runs explicitly report **Deployment not configured** and do not publish. A green source-check run alone does not mean a website was deployed.

The existing public demo at https://paddle-ipl-auction-arena.kasivinay3.chatgpt.site is hosted by Sites. This workflow creates a separate Worker in your own Cloudflare account, using its own URL and database. It does not update the existing Sites URL or move existing auction rooms. Keep the database ID unchanged between deployments to preserve rooms on the new website.

## One-time connection

1. Sign in to your Cloudflare account at https://dash.cloudflare.com/.
2. Create a D1 database named `paddle-auction-db`. Record its database ID and the account ID.
3. Create a Cloudflare API token scoped to this account with Workers Scripts Edit and D1 Edit permissions. Add Workers Subdomain Read if required for publishing to the account's workers.dev address. Keep the token private.
4. In https://github.com/vkvkasi17-hub/IPL-Auction/settings/secrets/actions add the repository secret `CLOUDFLARE_API_TOKEN`. Paste the token into GitHub's secret field; never put it in code, the README, or chat.
5. In the Variables tab on that same settings page, add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_D1_DATABASE_ID` as repository variables with the IDs from step 2.
6. Open https://github.com/vkvkasi17-hub/IPL-Auction/actions and run **Check and deploy auction website** on `main`, or push a new commit.
7. Confirm that **Publish website** succeeds, then open the URL in that step's output. If any deployment step is skipped, the website has not been deployed by that run.

Only `main` pushes and manual runs trigger this workflow; pull requests do not deploy. Deployment jobs run one at a time and are not interrupted midway through database migrations. Do not add approval requirements to the workflow if you want fully automatic publication.

For schema edits, generate and commit a new migration with `npm run db:generate`. Never rewrite a migration already applied to the live database. A failed deployment can leave completed migrations applied; correct the failure before retrying.

## Later edits

```sh
git add .
git commit -m "Update auction website"
git push
```

Watch the run in GitHub Actions. Once Cloudflare is connected, successful pushes update the new Cloudflare-hosted URL automatically.

Official reference: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

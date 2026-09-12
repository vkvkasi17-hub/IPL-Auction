import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import './sites-env.mjs';

function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Build produces the local Worker configuration. No cloud account is required.
run(['scripts/run-framework.mjs', 'build']);
const configPath = 'dist/server/wrangler.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const db = config.d1_databases.find(binding => binding.binding === 'DB');
if (!db) throw new Error('The generated configuration is missing the DB binding.');
db.migrations_dir = '../../drizzle';
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

// Wrangler records applied migrations; rerunning setup preserves existing rooms.
run(['--import', './scripts/sites-env.mjs', './node_modules/wrangler/bin/wrangler.js',
  'd1', 'migrations', 'apply', 'DB', '--local', '--config', configPath,
  '--persist-to', '.wrangler/state']);
console.log('Local database ready. Start with npm run dev.');

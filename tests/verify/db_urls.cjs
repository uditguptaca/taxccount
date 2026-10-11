// Which database address the app picks. Rules: Neon only, pooled Neon first, a
// Supabase address is never used, and a local address is fine for development.
const assert = require('assert');
const { candidateDatabaseUrls, ignoredDatabaseUrls, hostKind } = require('../../src/db/setup.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  PASS ' + name); };
const names = (env) => candidateDatabaseUrls(env).map((u) => u.name);

const NEON_POOLED = 'postgresql://u:p@ep-cool-1234-pooler.us-east-2.aws.neon.tech/db?sslmode=require';
const NEON_DIRECT = 'postgresql://u:p@ep-cool-1234.us-east-2.aws.neon.tech/db?sslmode=require';
const SUPABASE = 'postgresql://postgres:p@db.abcdefgh.supabase.co:5432/postgres';
const SUPABASE_POOLER = 'postgresql://postgres.abcdefgh:p@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

ok('host kinds', () => {
  assert.strictEqual(hostKind(NEON_POOLED), 'neon-pooled');
  assert.strictEqual(hostKind(NEON_DIRECT), 'neon');
  assert.strictEqual(hostKind(SUPABASE), 'supabase');
  assert.strictEqual(hostKind(SUPABASE_POOLER), 'supabase');
  assert.strictEqual(hostKind('postgresql://postgres:x@127.0.0.1:5432/app'), 'other');
});
ok('Neon only: a Supabase DATABASE_URL is never used', () => {
  const env = { DATABASE_URL: SUPABASE, DATABASE_URL_DIRECT: SUPABASE_POOLER, DATABASE_POSTGRES_URL: NEON_POOLED };
  assert.deepStrictEqual(names(env), ['DATABASE_POSTGRES_URL']);
  assert.deepStrictEqual(ignoredDatabaseUrls(env).map((u) => u.name).sort(), ['DATABASE_URL', 'DATABASE_URL_DIRECT']);
});
ok('the pooled Neon address is tried before the direct one', () => {
  assert.deepStrictEqual(names({ DATABASE_URL_UNPOOLED: NEON_DIRECT, DATABASE_URL: NEON_POOLED }), ['DATABASE_URL', 'DATABASE_URL_UNPOOLED']);
});
ok('Supabase alone leaves nothing to connect to (clear error, never a silent fallback)', () => {
  assert.deepStrictEqual(names({ DATABASE_URL: SUPABASE, POSTGRES_URL: SUPABASE_POOLER }), []);
  assert.strictEqual(candidateDatabaseUrls({ DATABASE_URL: SUPABASE }).length, 0);
});
ok('a local database still works for development and tests', () => {
  assert.deepStrictEqual(names({ DATABASE_URL: 'postgresql://postgres:x@127.0.0.1:5432/app' }), ['DATABASE_URL']);
});
ok('no variables at all', () => assert.deepStrictEqual(names({}), []));
console.log(`\nRESULT: ${n} passed, 0 failed`);

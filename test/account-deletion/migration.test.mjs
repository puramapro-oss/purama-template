import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test, before, after } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const resolveModule = createRequire(import.meta.url);
const { PGlite } = await import(pathToFileURL(resolveModule.resolve(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite')).href);

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const migration = fs.readFileSync(path.join(ROOT, 'migrations/20261122_profile_deletion_request_timestamp.sql'), 'utf8');
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
let db, sequence = 0;

before(async () => {
  db = new PGlite();
  await db.exec(`
    CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}'), ('${other}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated, anon;
  `);
});
after(async () => { if (db) await db.close(); });

async function fixture({ legacy = false, existingTimestamp = false } = {}) {
  const schema = `deletion_test_${++sequence}`;
  await db.exec(`
    CREATE SCHEMA ${schema};
    CREATE TABLE ${schema}.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text NOT NULL,
      note text NOT NULL DEFAULT 'historical data'
      ${legacy ? ', deletion_requested boolean DEFAULT false' : ''}
      ${existingTimestamp ? ', deletion_requested_at timestamptz' : ''}
    );
    INSERT INTO ${schema}.profiles(id, email) VALUES
      ('${owner}', 'owner@example.test'), ('${other}', 'other@example.test');
  `);
  const apply = () => db.exec(migration.replaceAll('{{SLUG}}', schema));
  return { schema, apply };
}

async function enableOwnProfileRls(schema) {
  await db.exec(`
    ALTER TABLE ${schema}.profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY own_profile ON ${schema}.profiles TO authenticated
      USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    GRANT USAGE ON SCHEMA ${schema} TO authenticated, anon;
    GRANT SELECT, UPDATE ON ${schema}.profiles TO authenticated, anon;
  `);
}

async function asRole(role, user, sql, values = []) {
  assert.ok(['authenticated', 'anon'].includes(role));
  await db.exec(`BEGIN; SET LOCAL ROLE ${role};`);
  try {
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [user || '']);
    const result = await db.query(sql, values);
    await db.exec('COMMIT'); return result;
  } catch (error) {
    await db.exec('ROLLBACK'); throw error;
  }
}

async function read(schema, id = owner) {
  return (await db.query(`SELECT id, email, note, deletion_requested, deletion_requested_at FROM ${schema}.profiles WHERE id = $1`, [id])).rows[0];
}

test('ajoute les colonnes manquantes sans modifier les données historiques', async () => {
  const f = await fixture(); await f.apply();
  const row = await read(f.schema);
  assert.equal(row.email, 'owner@example.test'); assert.equal(row.note, 'historical data');
  assert.equal(row.deletion_requested, false); assert.equal(row.deletion_requested_at, null);
  assert.equal((await db.query('SELECT count(*)::int AS total FROM auth.users')).rows[0].total, 2);
});

test('une ancienne demande sans date reste sans date après migration et réexécution', async () => {
  const f = await fixture({ legacy: true });
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true WHERE id = $1`, [owner]);
  await f.apply(); await f.apply();
  const row = await read(f.schema);
  assert.equal(row.deletion_requested, true); assert.equal(row.deletion_requested_at, null);
  assert.equal(row.note, 'historical data');
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true, deletion_requested_at = '2000-01-01' WHERE id = $1`, [owner]);
  assert.equal((await read(f.schema)).deletion_requested_at, null);
});

test('une demande authentifiée reçoit la date du serveur et ignore une date client passée', async () => {
  const f = await fixture(); await f.apply(); await enableOwnProfileRls(f.schema);
  const beforeTime = (await db.query('SELECT clock_timestamp() AS now')).rows[0].now;
  const result = await asRole('authenticated', owner,
    `UPDATE ${f.schema}.profiles SET deletion_requested = true, deletion_requested_at = '2000-01-01' WHERE id = $1 RETURNING deletion_requested_at`, [owner]);
  const afterTime = (await db.query('SELECT clock_timestamp() AS now')).rows[0].now;
  assert.equal(result.rows.length, 1);
  const timestamp = result.rows[0].deletion_requested_at;
  assert.ok(timestamp >= beforeTime && timestamp <= afterTime);
  assert.notEqual(timestamp.toISOString(), '2000-01-01T00:00:00.000Z');
});

test('une répétition ou une tentative de réécriture conserve la date initiale', async () => {
  const f = await fixture(); await f.apply();
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true WHERE id = $1`, [owner]);
  const first = (await read(f.schema)).deletion_requested_at.toISOString();
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true, deletion_requested_at = '2000-01-01' WHERE id = $1`, [owner]);
  assert.equal((await read(f.schema)).deletion_requested_at.toISOString(), first);
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested_at = NULL WHERE id = $1`, [owner]);
  assert.equal((await read(f.schema)).deletion_requested_at.toISOString(), first);
});

test('annuler efface la date, puis une nouvelle demande recommence le délai', async () => {
  const f = await fixture({ legacy: true, existingTimestamp: true });
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true, deletion_requested_at = '2000-01-01' WHERE id = $1`, [owner]);
  await f.apply(); await enableOwnProfileRls(f.schema);
  await asRole('authenticated', owner, `UPDATE ${f.schema}.profiles SET deletion_requested = false, deletion_requested_at = '1999-01-01' WHERE id = $1`, [owner]);
  assert.equal((await read(f.schema)).deletion_requested_at, null);
  const beforeTime = (await db.query('SELECT clock_timestamp() AS now')).rows[0].now;
  await asRole('authenticated', owner, `UPDATE ${f.schema}.profiles SET deletion_requested = true WHERE id = $1`, [owner]);
  assert.ok((await read(f.schema)).deletion_requested_at >= beforeTime);
  const due = await db.query(`SELECT count(*)::int AS total FROM ${f.schema}.profiles WHERE deletion_requested IS TRUE AND deletion_requested_at <= statement_timestamp() - interval '720 hours'`);
  assert.equal(due.rows[0].total, 0);
});

test('une demande annulée en transaction ne laisse aucun horodatage validé', async () => {
  const f = await fixture(); await f.apply();
  await db.exec('BEGIN');
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true WHERE id = $1`, [owner]);
  assert.ok((await read(f.schema)).deletion_requested_at);
  await db.exec('ROLLBACK');
  const row = await read(f.schema);
  assert.equal(row.deletion_requested, false); assert.equal(row.deletion_requested_at, null);
});

test('la migration préserve une date préexistante et ne supprime aucun compte', async () => {
  const f = await fixture({ legacy: true, existingTimestamp: true });
  await db.query(`UPDATE ${f.schema}.profiles SET deletion_requested = true, deletion_requested_at = '2026-10-01T10:30:00Z' WHERE id = $1`, [owner]);
  const original = await read(f.schema); await f.apply(); await f.apply();
  assert.deepEqual(await read(f.schema), original);
  assert.equal((await db.query('SELECT count(*)::int AS total FROM auth.users')).rows[0].total, 2);
});

test('les opérations sans identité ou sur un autre profil restent interdites par la fixture RLS', async () => {
  const f = await fixture(); await f.apply(); await enableOwnProfileRls(f.schema);
  for (const [role, principal, id] of [['anon', null, owner], ['authenticated', null, owner], ['authenticated', owner, other]]) {
    const result = await asRole(role, principal,
      `UPDATE ${f.schema}.profiles SET deletion_requested = true, deletion_requested_at = '2000-01-01' WHERE id = $1 RETURNING id`, [id]);
    assert.equal(result.rows.length, 0);
  }
  assert.equal((await read(f.schema)).deletion_requested, false);
  assert.equal((await read(f.schema, other)).deletion_requested, false);
});

test('les insertions ne peuvent fournir une date de demande arbitraire', async () => {
  const f = await fixture(); await f.apply();
  const requested = '33333333-3333-4333-8333-333333333333';
  const ordinary = '44444444-4444-4444-8444-444444444444';
  await db.query('INSERT INTO auth.users VALUES ($1), ($2)', [requested, ordinary]);
  const beforeTime = (await db.query('SELECT clock_timestamp() AS now')).rows[0].now;
  await db.query(`INSERT INTO ${f.schema}.profiles(id, email, deletion_requested, deletion_requested_at) VALUES ($1, 'new-request@example.test', true, '2000-01-01'), ($2, 'ordinary@example.test', false, '2000-01-01')`, [requested, ordinary]);
  assert.ok((await read(f.schema, requested)).deletion_requested_at >= beforeTime);
  assert.equal((await read(f.schema, ordinary)).deletion_requested_at, null);
});

test('le schéma neuf et la migration utilisent le même trigger et les types cohérents', () => {
  const schema = fs.readFileSync(path.join(ROOT, 'schema.sql'), 'utf8');
  const start = '-- BEGIN PROFILE DELETION REQUEST TIMESTAMP';
  const end = '-- END PROFILE DELETION REQUEST TIMESTAMP';
  const block = sql => sql.slice(sql.indexOf(start), sql.indexOf(end) + end.length);
  assert.equal(block(schema), block(migration));
  assert.match(schema, /deletion_requested BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(schema, /deletion_requested_at TIMESTAMPTZ/);
  const types = fs.readFileSync(path.join(ROOT, 'src/types/database.ts'), 'utf8');
  assert.equal((types.match(/deletion_requested_at\??: string \| null/g) || []).length, 3);
});

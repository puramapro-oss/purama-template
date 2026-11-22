import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, NOW, THIRTY_DAYS, eligibleAt } from './handler-harness.mjs';

const account = (overrides = {}) => ({
  id: '11111111-1111-4111-8111-111111111111', email: 'private-fixture@example.test',
  deletion_requested: true, deletion_requested_at: eligibleAt, ...overrides,
});
const preserved = f => {
  assert.deepEqual(f.calls.authDeletes, [], 'No shared auth identity may be deleted');
  assert.deepEqual(f.calls.mutations, [], 'No profile/request may be changed by this cron');
};

for (const headers of [{}, { 'x-cron-secret': 'wrong' }, { authorization: 'Bearer wrong' }]) {
  test(`refuse le cron non authentifié ${JSON.stringify(headers)}`, async () => {
    const f = fixture({ rows: [account()] });
    assert.equal((await f.request(headers)).status, 401);
    assert.equal(f.calls.clients, 0); preserved(f);
  });
}

test('refuse avant accès DB une configuration sans secret', async () => {
  const f = fixture({ configuredSecret: null });
  assert.equal((await f.request()).status, 500);
  assert.equal(f.calls.clients, 0); preserved(f);
});

for (const headers of [{ 'x-cron-secret': 'fixture-secret' }, { authorization: 'Bearer fixture-secret' }]) {
  test(`aucune demande est un vrai succès avec ${Object.keys(headers)[0]}`, async () => {
    const f = fixture(); const result = await f.request(headers);
    assert.equal(result.status, 200); assert.equal(result.body.deleted, 0); preserved(f);
  });
}

test('une erreur SQL ne devient jamais un faux résultat vide', async () => {
  const f = fixture({ queryError: true }); const result = await f.request();
  assert.equal(result.status, 500);
  assert.ok(result.body.error);
  assert.doesNotMatch(JSON.stringify(result.body), /fixture-private-database-detail/);
  preserved(f);
});

test('une exception réseau reste visible sans suppression', async () => {
  const f = fixture({ queryThrows: true }); const result = await f.request();
  assert.equal(result.status, 500); assert.ok(result.body.error); preserved(f);
});

const ineligible = [
  ['ancien flag sans date', { deletion_requested_at: null }],
  ['date absente', { deletion_requested_at: undefined }],
  ['date future', { deletion_requested_at: new Date(NOW + THIRTY_DAYS).toISOString() }],
  ['délai incomplet d’une milliseconde', { deletion_requested_at: new Date(NOW - THIRTY_DAYS + 1).toISOString() }],
  ['demande récente', { deletion_requested_at: new Date(NOW - 24 * 60 * 60 * 1000).toISOString() }],
  ['demande annulée', { deletion_requested: false }],
];
for (const [label, overrides] of ineligible) {
  test(`${label} ne déclenche aucun effacement`, async () => {
    const f = fixture({ rows: [account(overrides)] }); const result = await f.request();
    assert.equal(result.status, 200); assert.equal(result.body.deleted, 0); preserved(f);
  });
}

test('trente jours exacts restent bloqués tant que le service global est absent', async () => {
  const f = fixture({ rows: [account()] }); const result = await f.request();
  assert.equal(result.status, 503); assert.equal(result.body.deleted, 0);
  assert.equal(result.body.pending, 1);
  assert.equal(result.body.code, 'GLOBAL_ACCOUNT_DELETION_UNAVAILABLE'); preserved(f);
});

test('le comptage distingue les demandes admissibles sans exposer les identités', async () => {
  const f = fixture({ rows: [
    account(), account({ id: '22222222-2222-4222-8222-222222222222', deletion_requested_at: new Date(NOW - THIRTY_DAYS - 1).toISOString() }),
    account({ deletion_requested_at: null }), account({ deletion_requested: false }),
  ] });
  const result = await f.request();
  assert.equal(result.status, 503); assert.equal(result.body.pending, 2);
  assert.doesNotMatch(JSON.stringify(result.body), /private-fixture|11111111|22222222/);
  const query = f.calls.queries[0];
  assert.equal(query.table, 'profiles'); assert.equal(query.columns, 'id');
  assert.equal(query.options.count, 'exact'); assert.equal(query.options.head, true);
  assert.deepEqual(JSON.parse(JSON.stringify(query.filters)), [
    { op: 'eq', column: 'deletion_requested', value: true },
    { op: 'lte', column: 'deletion_requested_at', value: eligibleAt },
  ]);
  preserved(f);
});

for (const count of [null, undefined, NaN, Infinity, -1, 0.5]) {
  test(`un comptage invalide ${String(count)} ne devient pas un succès`, async () => {
    const f = fixture({ count }); const result = await f.request();
    assert.equal(result.status, 503); assert.ok(result.body.error); preserved(f);
  });
}

test('les passages répétés préservent la demande pour sa reprise centrale', async () => {
  const f = fixture({ rows: [account()] }); const original = JSON.stringify(f.rows);
  for (let i = 0; i < 2; i += 1) {
    const result = await f.request(); assert.equal(result.status, 503); assert.equal(result.body.pending, 1);
  }
  assert.equal(JSON.stringify(f.rows), original); preserved(f);
});

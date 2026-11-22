import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { NextRequest, NextResponse } from 'next/server.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const NOW = Date.parse('2026-11-22T12:00:00.000Z');
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const eligibleAt = new Date(NOW - THIRTY_DAYS).toISOString();

function fixture(options = {}) {
  const calls = { clients: 0, queries: [], authDeletes: [], mutations: [] };
  const rows = options.rows ?? [];
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [NOW])); }
    static now() { return NOW; }
  }
  const supabase = {
    from(table) {
      const query = { table, columns: null, options: null, filters: [] };
      calls.queries.push(query);
      const builder = {
        select(columns, selectOptions) { query.columns = columns; query.options = selectOptions; return builder; },
        eq(column, value) { query.filters.push({ op: 'eq', column, value }); return builder; },
        lte(column, value) { query.filters.push({ op: 'lte', column, value }); return builder; },
        not(column, op, value) { query.filters.push({ op: 'not', column, value, inner: op }); return builder; },
        delete() { calls.mutations.push('delete'); throw new Error('No fixture mutation allowed'); },
        update() { calls.mutations.push('update'); throw new Error('No fixture mutation allowed'); },
        then(resolve, reject) {
          if (options.queryThrows) return Promise.reject(new Error('fixture transport failed')).then(resolve, reject);
          const filtered = rows.filter(row => query.filters.every(filter => {
            if (filter.op === 'eq') return row[filter.column] === filter.value;
            if (filter.op === 'lte') return row[filter.column] != null && Date.parse(row[filter.column]) <= Date.parse(filter.value);
            if (filter.op === 'not' && filter.inner === 'is' && filter.value === null) return row[filter.column] != null;
            throw new Error('Unsupported fixture filter');
          }));
          return Promise.resolve({
            data: query.options?.head ? null : (options.queryError ? null : filtered),
            count: Object.prototype.hasOwnProperty.call(options, 'count') ? options.count : filtered.length,
            error: options.queryError ? { message: 'fixture-private-database-detail' } : null,
          }).then(resolve, reject);
        },
      };
      return builder;
    },
    auth: { admin: { async deleteUser(id) { calls.authDeletes.push(id); return { error: null }; } } },
  };

  function load(relativePath, imports) {
    const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const compiledModule = { exports: {} };
    vm.runInNewContext(compiled, {
      exports: compiledModule.exports,
      module: compiledModule,
      Date: FixedDate,
      process: { env: { CRON_SECRET: options.configuredSecret === undefined ? 'fixture-secret' : options.configuredSecret } },
      require(name) {
        if (name === 'next/server') return { NextResponse };
        if (Object.prototype.hasOwnProperty.call(imports, name)) return imports[name];
        throw new Error(`Unexpected fixture import: ${name}`);
      },
    }, { filename: relativePath });
    return compiledModule.exports;
  }
  const cronAuth = load('src/lib/cron-auth.ts', {});
  const handler = load('src/app/api/cron/account-deletion/route.ts', {
    '@/lib/cron-auth': cronAuth,
    '@/lib/supabase-server': { createServiceClient() { calls.clients += 1; return supabase; } },
  });
  return {
    calls,
    rows,
    async request(headers = { 'x-cron-secret': 'fixture-secret' }) {
      const response = await handler.GET(new NextRequest('https://fixture.invalid/api/cron/account-deletion', { headers }));
      return { status: response.status, body: await response.json() };
    },
  };
}

export { fixture, NOW, THIRTY_DAYS, eligibleAt };

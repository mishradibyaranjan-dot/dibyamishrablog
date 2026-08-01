#!/usr/bin/env node
/**
 * CI guard against security regressions in the visitor tracking surface
 * (public.visitor_logs / public.visitors and the /api/public/track-visit route).
 *
 * Fails the build when any of these invariants break:
 *  1. Both tables still have RLS enabled somewhere in the migration history.
 *  2. The RESTRICTIVE deny-all-client-writes policies are the last word for
 *     anon/authenticated on both tables (no later migration re-opens them).
 *  3. No migration grants INSERT/UPDATE/DELETE on either table to anon or
 *     authenticated (writes are service-role only).
 *  4. The track-visit endpoint never trusts a client-supplied user id and still
 *     verifies identity with supabaseAdmin.auth.getUser(<bearer token>).
 *  5. The browser tracker never sends a userId field in its payload.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";
const TABLES = ["visitor_logs", "visitors"];
const ROUTE = "src/routes/api/public/track-visit.ts";
const TRACKER = "src/lib/visitor-tracking.ts";

const errors = [];
const notes = [];

function fail(msg) {
  errors.push(msg);
}

// ---------------------------------------------------------------- migrations
const files = existsSync(MIGRATIONS_DIR)
  ? readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort()
  : [];

if (files.length === 0) fail(`No migrations found in ${MIGRATIONS_DIR}.`);

/** @type {Record<string, { rls: boolean, denyWrites: string|null, reopened: string[], grants: string[] }>} */
const state = Object.fromEntries(
  TABLES.map((t) => [t, { rls: false, denyWrites: null, reopened: [], grants: [] }]),
);

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  // Strip line comments so commented-out SQL never trips the guard.
  const clean = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");

  for (const table of TABLES) {
    const t = state[table];
    const tableRe = new RegExp(`(public\\.)?${table}\\b`, "i");

    if (new RegExp(`alter\\s+table\\s+(public\\.)?${table}\\s+enable\\s+row\\s+level\\s+security`, "i").test(clean)) {
      t.rls = true;
    }
    if (new RegExp(`alter\\s+table\\s+(public\\.)?${table}\\s+disable\\s+row\\s+level\\s+security`, "i").test(clean)) {
      t.rls = false;
      fail(`${file}: disables row level security on public.${table}.`);
    }

    // Statement-level scan of CREATE POLICY / GRANT / DROP POLICY.
    for (const stmt of clean.split(";")) {
      const s = stmt.trim();
      if (!s || !tableRe.test(s)) continue;
      const lower = s.toLowerCase();

      if (lower.startsWith("create policy")) {
        const restrictive = /as\s+restrictive/i.test(s);
        const clientRoles = /\bto\s+[^\n]*\b(anon|authenticated|public)\b/i.test(s);
        const denies = /using\s*\(\s*false\s*\)/i.test(s) && /with\s+check\s*\(\s*false\s*\)/i.test(s);
        if (restrictive && clientRoles && denies) {
          t.denyWrites = file;
        } else if (clientRoles && /for\s+(all|insert|update|delete)/i.test(lower) && !restrictive) {
          t.reopened.push(`${file}: permissive write policy for client roles on public.${table}`);
        }
      }

      if (lower.startsWith("drop policy") && t.denyWrites) {
        // A later migration dropping the deny policy must recreate it in the
        // same file; that recreate is picked up above and resets denyWrites.
        const dropsDeny = /deny[^"']*writes/i.test(s);
        if (dropsDeny) t.denyWrites = null;
      }

      if (lower.startsWith("grant") && /\b(insert|update|delete|all)\b/i.test(lower) && /\b(anon|authenticated|public)\b/i.test(lower)) {
        t.grants.push(`${file}: grants write privileges on public.${table} to a client role`);
      }
    }
  }
}

for (const table of TABLES) {
  const t = state[table];
  if (!t.rls) fail(`public.${table}: row level security is not enabled in the migration history.`);
  if (!t.denyWrites) {
    fail(`public.${table}: missing an active RESTRICTIVE deny-all-client-writes policy (USING (false) WITH CHECK (false)).`);
  } else {
    notes.push(`public.${table}: deny-client-writes policy active (${t.denyWrites}).`);
  }
  t.reopened.forEach(fail);
  t.grants.forEach(fail);
}

// ------------------------------------------------------------------ app code
function read(path) {
  if (!existsSync(path)) {
    fail(`Missing expected file: ${path}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

const route = read(ROUTE);
if (route) {
  if (/body\.userId|body\["userId"\]|body\['userId'\]/.test(route)) {
    fail(`${ROUTE}: reads a client-supplied userId — identity must come from a verified JWT only.`);
  }
  if (!/auth\.getUser\(\s*bearer/.test(route)) {
    fail(`${ROUTE}: no supabaseAdmin.auth.getUser(bearer) verification found.`);
  } else {
    notes.push(`${ROUTE}: verifies caller identity server-side via bearer token.`);
  }
  if (!/user_id:\s*verifiedUserId/.test(route)) {
    fail(`${ROUTE}: user_id is not set from the server-verified user id.`);
  }
}

const tracker = read(TRACKER);
if (tracker && /\buserId\s*:/.test(tracker)) {
  fail(`${TRACKER}: payload includes a userId field — the server must derive identity from the JWT.`);
}

// -------------------------------------------------------------------- report
if (errors.length === 0) {
  console.log("✅ Visitor tracking security guard passed.");
  for (const n of notes) console.log(`   • ${n}`);
  process.exit(0);
}

console.error(`❌ Visitor tracking security guard failed — ${errors.length} regression(s):\n`);
for (const e of errors) console.error(`  • ${e}`);
console.error(
  "\nVisitor tracking tables must stay service-role write-only with admin-only reads, and /api/public/track-visit must derive user identity from a verified Supabase JWT.",
);
process.exit(1);

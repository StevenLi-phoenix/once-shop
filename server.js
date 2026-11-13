#!/usr/bin/env node
'use strict';

/**
 * ONCE — a single-use website.
 *
 * Every page and every asset is served from a random URL that works exactly
 * once. `/` is the only stable address: it mints a fresh ticket and redirects.
 */

const http = require('node:http');
const crypto = require('node:crypto');

const { PRODUCTS, bySku } = require('./data');
const R = require('./render');

const PORT = Number(process.env.PORT || 4173);
const TTL = 20 * 60 * 1000; // unused tickets die after 20 minutes
const MAX_LIVE = 20000;

const live = new Map(); // token -> { kind, ref, born }
const dead = new Map(); // token -> { at, count }  (tombstones, for honest 404s)

/* ---------------------------------------------------------------- tickets */

function mint(kind, ref) {
  if (live.size >= MAX_LIVE) {
    let n = 0;
    const drop = Math.floor(MAX_LIVE * 0.1);
    for (const k of live.keys()) {
      live.delete(k);
      if (++n >= drop) break;
    }
  }
  const t = crypto.randomBytes(9).toString('base64url');
  live.set(t, { kind, ref, born: Date.now() });
  return t;
}

function consume(t) {
  const rec = live.get(t);
  if (!rec) {
    const tomb = dead.get(t);
    if (tomb) {
      tomb.count++;
      tomb.at = Date.now();
    }
    return null;
  }
  live.delete(t);
  dead.set(t, { at: Date.now(), count: 1 });
  return rec;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of live) if (now - v.born > TTL) live.delete(k);
  for (const [k, v] of dead) if (now - v.at > 6 * 3600e3) dead.delete(k);
}, 60e3).unref();

/* ---------------------------------------------------------------- helpers */

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private',
  Pragma: 'no-cache',
  Expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
};

function send(res, status, type, body, headers = {}) {
  const h = { 'Content-Type': type, ...NO_STORE, 'X-Once': 'single-use', ...headers };
  if (Array.isArray(h['Set-Cookie']) && h['Set-Cookie'].length === 0) delete h['Set-Cookie'];
  res.writeHead(status, h);
  res.end(body);
}

function redirect(res, location, cookies = []) {
  send(res, 302, 'text/plain; charset=utf-8', `moved: ${location}`, {
    Location: location,
    ...(cookies.length ? { 'Set-Cookie': cookies } : {}),
  });
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

const readCart = (c) => (c || '').split('.').filter((s) => bySku[s]);
const writeCart = (list) => list.join('.');
const hopsOf = (c) => {
  const n = parseInt(c || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/* ---------------------------------------------------------------- context */

function makeCtx(cart, hops, token) {
  return {
    cart,
    hops,
    token,
    go: (ref) => '/go/' + mint('page', ref),
    asset: (ref) => '/go/' + mint('asset', ref),
    link: (kind, ref) => '/go/' + mint(kind, ref),
  };
}

/* ---------------------------------------------------------------- dispatch */

function serveAsset(res, ref, head) {
  if (ref === 'css') return send(res, 200, 'text/css; charset=utf-8', head ? '' : R.CSS, { 'X-Once-Asset': 'css' });
  if (ref === 'js')
    return send(res, 200, 'text/javascript; charset=utf-8', head ? '' : R.JS, { 'X-Once-Asset': 'js' });
  if (ref === 'icon') return send(res, 200, 'image/svg+xml', head ? '' : R.icon(), { 'X-Once-Asset': 'icon' });
  if (ref === 'hero') return send(res, 200, 'image/svg+xml', head ? '' : R.heroArt(), { 'X-Once-Asset': 'hero' });
  if (ref.startsWith('img:')) {
    const p = bySku[ref.slice(4)];
    if (!p) return send(res, 404, 'text/plain; charset=utf-8', 'no such asset');
    return send(res, 200, 'image/svg+xml', head ? '' : R.productArt(p), { 'X-Once-Asset': 'product' });
  }
  return send(res, 404, 'text/plain; charset=utf-8', 'no such asset');
}

function dispatch(res, rec, state) {
  const { cart, hops, token, head } = state;

  if (rec.kind === 'asset') return serveAsset(res, rec.ref, head);

  /* cart actions: consume the ticket, mutate, then hop to a brand-new URL */
  if (rec.kind === 'add' || rec.kind === 'remove' || rec.kind === 'checkout') {
    let nextCart = cart;
    let target = 'cart';

    if (rec.kind === 'add') nextCart = cart.concat(rec.ref);
    if (rec.kind === 'remove') nextCart = cart.filter((s) => s !== rec.ref);
    if (rec.kind === 'checkout') {
      nextCart = [];
      target = 'done:' + 'ONCE-' + Date.now().toString(36).toUpperCase().slice(-6);
    }

    const next = '/go/' + mint('page', target);
    return redirect(res, next, [`c=${writeCart(nextCart)}; Path=/; Max-Age=86400; SameSite=Lax`]);
  }

  /* page */
  const nextHops = hops + 1;
  const ctx = makeCtx(cart, nextHops, token);

  let html;
  let status = 200;

  if (rec.kind === 'page') {
    const ref = rec.ref;
    if (ref === 'home') html = R.home(ctx);
    else if (ref === 'about') html = R.aboutPage(ctx);
    else if (ref === 'cart') html = R.cartPage(ctx);
    else if (ref.startsWith('cat:')) html = R.category(ctx, ref.slice(4));
    else if (ref.startsWith('product:')) html = R.product(ctx, ref.slice(8));
    else if (ref.startsWith('done:')) html = R.donePage(ctx, ref.slice(5));
    else html = R.notFound(ctx, 'path');
  }

  if (!html) html = R.notFound(ctx, 'path');

  if (!html) return; // unreachable, keeps linters quiet

  send(res, status, 'text/html; charset=utf-8', head ? '' : html, {
    'Set-Cookie': [`h=${nextHops}; Path=/; Max-Age=86400; SameSite=Lax`],
  });
}

/* ---------------------------------------------------------------- routing */

function reply404(res, { cart, hops, reason, token = '', count = 0, head }) {
  const ctx = makeCtx(cart, hops + 1, '');
  const html = R.notFound(ctx, reason, { count });
  send(res, 404, 'text/html; charset=utf-8', head ? '' : html, {
    'Set-Cookie': [`h=${hops + 1}; Path=/; Max-Age=86400; SameSite=Lax`],
    'X-Once': 'burned',
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://once.local');
  const path = url.pathname;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'text/plain; charset=utf-8', 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  const head = req.method === 'HEAD';
  const ck = parseCookies(req);
  const cart = readCart(ck.c);
  const hops = hopsOf(ck.h);

  /* the only stable address in the shop */
  if (path === '/') {
    const t = mint('page', 'home');
    return redirect(res, '/go/' + t);
  }

  /* the browser always asks for this one; let it hop too */
  if (path === '/favicon.ico') {
    const t = mint('asset', 'icon');
    return redirect(res, '/go/' + t);
  }

  if (path.startsWith('/go/')) {
    const token = path.slice(4);
    const rec = live.get(token);

    if (!rec) {
      const tomb = dead.get(token);
      return reply404(res, {
        cart,
        hops,
        head,
        reason: tomb ? 'used' : 'unknown',
        token,
        count: tomb ? tomb.count : 0,
      });
    }

    /* single use: burn it before we even render */
    live.delete(token);
    dead.set(token, { at: Date.now(), count: 1 });

    console.log(
      `%s %s -> %s:%s  hop ${hops + 1}`,
      new Date().toISOString().slice(11, 19),
      req.method,
      rec.kind,
      rec.ref || '-'
    );

    try {
      return dispatch(res, rec, { cart, hops, token, head });
    } catch (err) {
      console.error('render failed:', err);
      return send(res, 500, 'text/plain; charset=utf-8', 'the page burned a little too fast');
    }
  }

  return reply404(res, { cart, hops, head, reason: 'path' });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ONCE — 一次性商店');
  console.log('  每一页只能用一次。');
  console.log('');
  console.log(`  http://localhost:${PORT}/`);
  console.log('');
});

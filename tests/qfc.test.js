#!/usr/bin/env node
'use strict';
/* Quantum Flow Calculator — self-contained smoke-test suite (no dependencies).
 * Run: node tests/qfc.test.js   (or: npm test)
 * Runs the app's full script in a Node vm with a stubbed DOM, then asserts the
 * math engine, FX/unit converter, constants, #N references, edit cascade and CSV escaping. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let fail = 0, pass = 0;
const chk = (n, c) => { console.log((c ? 'PASS' : 'FAIL') + ' - ' + n); if (c) pass++; else fail++; };

/* --- structural checks on the HTML shell --- */
chk('file >10KB', html.length > 10000);
chk('no TODO/STUB markers', !/TODO|STUB/i.test(html));
const bal = (tag) =>
  (html.match(new RegExp('<' + tag + '\\b', 'g')) || []).length ===
  (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
chk('div tags balanced', bal('div'));
chk('section tags balanced', bal('section'));
chk('script tags balanced', bal('script'));

/* --- run the app script in a sandbox with a stubbed DOM --- */
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('FAIL - no script block'); process.exit(1); }
const elStub = () => ({
  style: {}, dataset: {},
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  getContext: () => ctxProxy, addEventListener() {}, focus() {}, appendChild() {},
  remove() {}, click() {}, querySelector: () => null,
  set innerHTML(v) {}, get innerHTML() { return ''; },
  set textContent(v) {}, get textContent() { return ''; },
  scrollLeft: 0, offsetWidth: 100, value: '', max: 0, min: 0, disabled: false, title: '',
  getBoundingClientRect: () => ({ width: 400, height: 300 }),
  querySelectorAll: () => [], setAttribute() {},
  parentElement: { getBoundingClientRect: () => ({ width: 400, height: 300 }) }
});
const ctxHolder = { canvas: { width: 0, height: 0 } };
const ctxProxy = new Proxy({}, {
  get: (t, p) => { if (p === 'canvas') return ctxHolder.canvas; if (typeof p === 'symbol') return undefined; return () => {}; },
  set: (t, p, v) => { if (p === 'width' || p === 'height') ctxHolder.canvas[p] = v; return true; }
});
const store = {};
const sandbox = {
  console, setTimeout, clearTimeout, Math, JSON, Date, Number, String, Array, Object,
  parseInt, parseFloat, isNaN, Infinity, NaN, RegExp,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} }, Blob: function () {},
  performance: { now: () => 0 }, requestAnimationFrame: () => 0,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  window: { addEventListener() {}, devicePixelRatio: 1, AudioContext: null, webkitAudioContext: null, SpeechRecognition: null, prompt: () => null },
  document: {
    getElementById: () => elStub(), querySelectorAll: () => [], addEventListener() {},
    createElement: () => elStub(), createDocumentFragment: () => ({ appendChild() {} }),
    body: { getAttribute: () => 'dark', setAttribute() {}, appendChild() {} }
  }
};
vm.createContext(sandbox);
try { vm.runInContext(m[1], sandbox, { timeout: 8000 }); chk('app script parses & init runs', true); }
catch (e) { chk('app script parses & init runs', false); console.log('   -> ' + e.message); process.exit(1); }

const E = (s) => sandbox.evaluate(s);
const close = (a, b, eps) => { eps = eps || 1e-9; return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < eps; };
const t = (n, expr, want) => {
  const r = E(expr);
  const got = r.value !== undefined ? r.value : (r.error || 'ERR');
  const ok = (typeof want === 'number' && typeof got === 'number') ? close(got, want) : String(got) === String(want);
  chk(n + ' : ' + expr + ' -> ' + got, ok);
};

/* --- math engine --- */
t('precedence', '2+3*4', 14);
t('parens', '(2+3)*4', 20);
t('power right-assoc', '2^3^2', 512);
t('unary minus', '-3+5', 2);
t('division', '10/4', 2.5);
t('float cleanup', '0.1+0.2', 0.3);
t('percent to decimal', '200+10%', 200.1);
t('implicit groups', '6/2*(1+2)', 9);
t('negative result', '2-7', -5);
{ const dz = E('1/0'); chk('div by zero -> Infinity', dz.value === Infinity); }
{ const p = sandbox.compute('8+'); chk('trailing-op live preview', typeof p.preview === 'number' && close(p.preview, 8)); }
t('auto-close paren', '(1+2', 3);
{ const f = sandbox.fmt;
  chk('fmt strips float noise', f(0.30000000000000004) === '0.3');
  chk('fmt Infinity', f(1 / 0) === '∞');
  chk('fmt NaN', f(0 / 0) === 'Undefined');
  chk('fmt big numbers', f(123456789012345) === '123456789012345'); }

/* --- FX & units --- */
{ const fx = sandbox.extractFX('250INR');
  chk('250INR defaults to USD', !!fx && fx.base === 'INR' && fx.quote === 'USD' && close(fx.toRate, 1 / 94.540498, 1e-5)); }
{ const fx = sandbox.extractFX('250INR in EUR');
  chk('250INR in EUR explicit pair', !!fx && fx.quote === 'EUR' && close(fx.toRate, 0.860629 / 94.540498, 1e-5)); }
{ const fx = sandbox.extractFX('1200USD in JPY');
  chk('1200USD in JPY', !!fx && close(fx.toRate, 156.019704, 1e-5)); }
chk('mass 5kg in g', close(sandbox.interpret('5kg in g').val, 5000));
chk('speed 80mph in kmh', close(sandbox.interpret('80mph in kmh').val, 128.74752));
chk('speed reverse kmh in mph', close(sandbox.interpret('128.74752kmh in mph').val, 80, 1e-4));
chk('temperature 32F in C', close(sandbox.interpret('32F in C').val, 0));
chk('fuel 8L/100km -> mpg', close(sandbox.interpret('8L/100km').val, 235.214583 / 8));
chk('norm 250INR inside expressions', close(parseFloat(sandbox.norm('250INR')), 250 / 94.540498));
t('inline FX in the calculator', '1200USD in JPY', 1200 * 156.019704);

/* --- scientific constants (long-press keys) --- */
t('pi', 'π', Math.PI);
t('euler', 'e', Math.E);
t('phi golden ratio', 'φ', (1 + Math.sqrt(5)) / 2);
t('compound 2*pi', '2*π', 2 * Math.PI);
t('euler in expression', 'e+1', Math.E + 1);

/* --- #N references & cascade editing --- */
sandbox.state.hist.push({ value: 10, raw: '5*2', input: '5*2' });
sandbox.state.hist.push({ value: 21, raw: '#1+11', input: '#1+11' });
t('#1 expands to line value', '#1+1', 11);
chk('unknown #9 rejected cleanly', E('#9').error === 'unknown # reference');
chk('expandRefs passthrough', sandbox.expandRefs('2+2') === '2+2');
chk('edit cascade re-runs dependents', sandbox.commitEdit(0, '4*4') && sandbox.state.hist[0].value === 16 && sandbox.state.hist[1].value === 27);
chk('invalid edit rejected, line intact', sandbox.commitEdit(0, 'abc!!') === false && sandbox.state.hist[0].value === 16);

/* --- CSV export --- */
chk('csv field escaping', sandbox.csvField('a,b') === '"a,b"' && sandbox.csvField('plain') === 'plain' && sandbox.csvField('say "hi"') === '"say ""hi"""');

/* --- misc --- */
chk('refreshFX defined', typeof sandbox.refreshFX === 'function');
{ const fr = sandbox.fmtResults([{ value: 10 }, { value: 20 }, { value: 30 }]);
  chk('fmtResults Σ/max/avg/n', fr.tot === '60' && fr.mx === '30' && fr.avg === '20' && fr.n === '3'); }

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

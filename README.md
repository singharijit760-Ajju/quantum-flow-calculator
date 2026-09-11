# ⚛ Quantum Flow Calculator

*A calculator with consciousness — the world's first predictive, intuitive calculation experience.*

Not a calculator — a **computational companion**. It anticipates, visualizes and converses: it builds a mental model of your calculation patterns, shows all possible results simultaneously, turns every equation into generative art, and speaks your language. Single file, zero dependencies, fully offline.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 🔮 **Predictive Engine** | Learns your `number-op-number` patterns and ranks your *next* operation — the top pick is tagged "predicted next". Persists in `localStorage`, gets sharper with use |
| ⚛ **Quantum Superposition** | While typing `a ∘ b`, all five results (`+ − × ÷ ^`) display simultaneously. Press `=` → the state **collapses** with a burst animation and a musical chord pitched to your result |
| 🎨 **Calculation as Art** | Every expression hashes to a deterministic seed driving a live Canvas mandala, Lissajous wave or constellation; the result's magnitude controls intensity |
| 🎙 **Multi-modal input** | Voice ("two hundred plus thirty percent equals"), swipe gestures (left = delete, right = clear), full keyboard support, long-press keys for **e, φ, π** |
| ⟠ **FX & Units** | Type `250INR` or `1200USD in JPY` → `=` converts. Mass (`5kg in g`), speed (`80mph in kmh`), temperature (`32F in C`), fuel (`8L/100km`). 30 currencies embedded offline; one-click **live refresh** when online |
| 🌊 **Session Flow** | Multi-session ledger with per-session history, `#N` references to earlier lines, and **✎ inline edits that cascade** — edit line 1 and dependent lines re-run automatically |
| ↗ **Export** | Session card as **PNG** (with Σ / max / avg chips), session as **CSV**, and the 🍹 gift: a random calculation rendered as cocktail art |
| ◐ **Themes** | Full dark/light theming, persisted |

## 🚀 Quick start

```bash
git clone https://github.com/<you>/quantum-flow-calculator.git
cd quantum-flow-calculator
open index.html            # that's it — no build, no install
# or serve it:
npx serve .
```

Works from `file://` too. Voice input and PWA install activate when served over http(s).

## 🧪 Testing

50+ automated smoke checks run the app's full script in a Node VM with a stubbed DOM — covering the math engine (precedence, parens, right-associative power, float cleanup, ∞), the FX/unit converter, constants, `#N` expansion, edit cascading and CSV escaping:

```bash
npm test          # → node tests/qfc.test.js   (no dependencies)
```

## ☁ Deploy to GitHub Pages

```bash
git init -b main
git add .
git commit -m "feat: Quantum Flow Calculator v3.0 — predictive, generative, offline-first"
git remote add origin https://github.com/<you>/quantum-flow-calculator.git
git push -u origin main
```

Then: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → your app lives at `https://<you>.github.io/quantum-flow-calculator/`.

## 📁 Structure

```
quantum-flow-calculator/
├── index.html            # the entire app (single file)
├── manifest.webmanifest  # PWA manifest
├── sw.js                 # service worker — cache-first, installable offline
├── icons/                # 192 / 512 px icons
├── tests/qfc.test.js     # smoke-test suite (node, zero deps)
├── package.json
├── LICENSE               # MIT
└── .gitignore
```

## 🔧 Notes

- **Math engine**: tokenizer → shunting-yard → RPN evaluation. No `eval`, ever.
- **FX rates**: er-api snapshot embedded (2026-09-04) as the offline fallback; FX mode → **↻ live refresh** fetches current rates (6 s timeout, graceful fallback). Service worker never caches the rates endpoint.
- **Storage**: history, sessions, learned model and theme live in `localStorage` — per browser, per origin. Nothing ever leaves the device; share cards are rendered client-side.
- **Voice**: Chrome / Edge / Safari support the Web Speech API. Firefox doesn't — the app detects this and falls back to a typing input.

## 📜 Changelog

- **v3.0** — live FX refresh, long-press constants (e φ π), CSV export, ledger line-editing with `#N` references and cascade re-evaluation
- **v2.0** — dark/light theme, FX & units modes, multi-session flow ledger, PNG share cards, 🍹 gift
- **v1.0** — predictive engine, superposition display, generative art, voice/gesture/touch, living timeline

## 📄 License

[MIT](LICENSE)

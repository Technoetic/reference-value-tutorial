# VALUE / SHIFT

A Korean interactive tutorial for Martin Fowler's **Change Reference to Value**. Two café products share a price tag: mutate that object, replace one owner's immutable value, then compare identity and value equality yourself.

**Play:** https://technoetic.github.io/reference-value-tutorial/

Six screens: introduction → shared mutation → value replacement → equality bench → six practice questions → minimal code and boundaries. Keyboard and mobile layouts, reduced motion, browser-local progress and notes. No accounts, analytics, external fonts or runtime dependencies.

## Run

Node.js 22 or newer (CI uses 24). No dependency installation required.

```sh
npm test
npm run build
npm start
```

Local URL: `http://127.0.0.1:8897/reference-value-tutorial/`. Each step has a hash URL, for example `#/equality`, so GitHub Pages supports direct links and refreshes without an HTML fallback for missing assets. Use `node scripts/server.mjs --port 8899` if the port is occupied.

## Teaching boundaries

- A value object is still a JavaScript object accessed by reference. Immutable instances can be shared.
- Replacement changes the selected owner's field. It does not modify the old shared value.
- This Money compares **amount and currency** in `equals`. JavaScript `===` and `includes` do not call it automatically.
- Products and orders with identity and lifecycle remain entities. Value conversion is contextual.
- Independent price calculations remain the same; aliasing side effects and price-object identity intentionally differ. This is not a promise of universal behavior equivalence.
- M1/M2 labels are illustrative IDs, not memory addresses. This demo only accepts nonnegative safe-integer amounts and three-letter uppercase currency labels; it is not a financial calculation library. No exchange-rate conversion.
- The small code example uses shallow `Object.freeze` with number/string fields; nested mutable objects need additional design.

The two café products, activities and questions are an educational adaptation of Fowler's catalog example, not a quotation of his book or an endorsement.

Primary sources:

- [Change Reference to Value](https://refactoring.com/catalog/changeReferenceToValue.html)
- [Value Object](https://martinfowler.com/bliki/ValueObject.html)

## Six webapp principles

Entry / screens / services / domain / shared modules are separate. CSS uses tokens / base / components. Classes own screen lifecycle and services. Content requests have timeout, cancellation, error/retry and stale-response protection. One entry with six navigable hash routes. The loaded build ID is embedded in HTML; a fresh version response detects updates and rollbacks. On the next clean navigation a full document loads the requested route; edits and saves are protected. No service worker.

All JavaScript and CSS asset paths contain the build identity. The Pages workflow retains verified immutable asset graphs, including older ones that cached entry HTML can reference, then publishes the new build atomically. Retention fails closed at 8 MB total or 2,048 assets; a future cleanup needs to respect cached clients. GitHub Pages controls its own CDN headers (observed `max-age=600`). A one-time entry gate checks the HTML's build against a fresh version response **before editable UI mounts**, and replaces a stale entry at the intended route. Running tabs still wait for their next clean navigation. Version requests and document transitions use fresh URL identities and fetch `no-store`. Legacy documents predating the gate receive it after their existing safe-navigation update. See `docs/handoff.json` for observed browser behavior and untested cases.

## Source map

- `src/domain`: Money and the two price experiments
- `src/screens`: lesson rendering and interaction
- `src/services`: routing, version detection, content and local storage
- `src/shared`: routes, formatting and safe HTML escaping
- `src/styles`: design tokens, base and components
- `data/lessons.json`: six lessons, six questions, primary sources
- `scripts`: deterministic build, local server, asset retention and manifest

The router and static delivery helpers adapt the author's earlier [Derived Query tutorial](https://github.com/Technoetic/derived-query-tutorial). No Sites hosting is used. MIT licensed.

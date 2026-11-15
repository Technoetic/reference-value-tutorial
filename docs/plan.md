# Change Reference to Value implementation plan

> For agentic workers: execute this plan using subagent-driven-development with independent review.

Goal: publish an accurate Korean interactive six-screen tutorial to GitHub Pages.
Architecture: vanilla ES modules with screen/service classes; pure price/equality model; hashed static build and guarded hash router.
Tech stack: Node 22+ builtins, HTML/CSS/JavaScript. Spec: docs/design.md.

## Global constraints

GitHub Pages only, no external runtime dependencies, no secrets or company data. Source ownership and pedagogical extension must be explicit. Invalid inputs never mutate state. Value equality includes currency. Value objects remain referenced objects.

## Review focus

- Shared aliases deliberately behave differently after replacement; don't promise universal equivalence.
- JavaScript ===/includes still compare object identity.
- Editing while version check is pending must block document replacement.
- Storage failure must preserve drafts and report failure.
- Deep links and history must keep URL and screen aligned.

## Tasks

- [ ] Domain: write behavior tests first; implement Money and PriceExperiment; verify mutation/replacement/equality/validation.
- [ ] Lessons: six sections and six independently reviewed practice questions from the two primary sources.
- [ ] App: implement screen classes, diagram, accessible input and real side-effect experiments; layered CSS.
- [ ] Infrastructure: adapt own proven router/version service, fresh content/storage services; regression tests.
- [ ] Build: hashed complete module graph, version.json, static server true404, Pages workflow.
- [ ] Verify: Node tests, real Aside interactions/two widths/update and failure experiments, independent concept/code review.
- [ ] Publish: public repo, GitHub Pages workflow, verify live build/assets/interaction; six-field handoff.

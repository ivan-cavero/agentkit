# Critic Design — building a blind critic that actually works

The critic decides the quality of the whole loop. A weak critic — one that shares context with the builder, grades a summary, or wants to be helpful — collapses the method into expensive self-congratulation.

## Three rules

### 1. Blind context
- The critic runs in its **own context window** and never sees the builder's reasoning, effort, or justification.
- It receives exactly two things: the **artifact** (or a pointer to it) and the **bar**.
- Reason: a model is extremely good at explaining why its work is reasonable. Reading that explanation anchors the critic and it agrees.
- Spawn a **fresh critic each round**. A reused critic remembers its previous verdict and defends it.

### 2. Inspect the real thing
- The critic must interact with the artifact: run the code and the tests, open the app and screenshot it, read the full draft, run the query on real data, execute the eval set, build the PoC.
- "The builder says it handles X" is not evidence. Output is.
- Every verdict cites **objective evidence**: pass/fail counts, measurements, a specific sentence, a screenshot, a response body.

### 3. Blind A/B against the reference
- Where the domain allows it, show the critic the artifact **and** the reference **without labeling which is which**, and ask which is better on each criterion.
- This removes ownership bias almost entirely. It is the single highest-leverage technique for design and writing.
- Repeat over several criteria, or several judges, and record the split (e.g. "reference preferred 5/5").

## What a good critic does

- **Defaults to FAIL.** The artifact has not cleared the bar until evidence says it has.
- **Tries at least two ways to refute** before passing anything.
- **Grades each criterion separately** instead of forming a single overall impression.
- **On FAIL, gives specific, actionable fixes** — where it lost and what to change — so the next round is targeted.
- **Records rejected hypotheses**, not just the verdict, so the run is auditable.
- **Keeps held-out checks** the builder has not seen, to test generalization rather than overfitting.

## Traps that ruin critics

| Trap | Consequence | Fix |
|------|-------------|-----|
| Shares context with the builder | Rubber stamp | Spawn the critic in a separate clean context |
| Grades the description | Passes work it never inspected | Require running/rendering/executing the artifact |
| Vague bar | Critic interprets it generously | Concrete bar with a named reference |
| Knows which side is the artifact | Ownership bias | Blind A/B |
| Wants to be encouraging | Early PASS | Instruct: "assume FAIL until objective evidence proves otherwise" |
| Reused across rounds | Defends its earlier verdict | Fresh critic per round |

## Multiple critics

For high-stakes work, run **several independent critics with different lenses** — correctness, performance, aesthetics, safety, accessibility — and combine their votes. Diversity of lens catches failure modes that three identical critics all miss. Pass only when every mandatory lens passes.

## Non-negotiable criteria

Some criteria must never be traded away. The critic has to be rigid about them:

- Coding: **a red required test is a FAIL**, however elegant the code.
- Design: **contrast below WCAG AA is a FAIL**.
- Data: **a failed independent recomputation is a FAIL**.
- Research: **an unverifiable citation is a FAIL**.
- Detection: **any false positive on benign logs is a FAIL**.
- Security: **no working PoC means no confirmed finding**.

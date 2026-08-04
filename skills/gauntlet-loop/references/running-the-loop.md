# Running the Loop — orchestration mechanics

How to actually operate a Gauntlet Loop: harness requirements, budget, parallelism, the progress workbench, and the final smoothing pass.

---

## 1. Harness requirements

The loop needs an agent that can:

- open and edit files,
- run code, tests, and queries,
- render output and inspect screenshots,
- call tools,
- and **spawn sub-agents with independent context windows**.

Claude Code, Cowork, and Codex-style harnesses qualify. A plain chat window does not — without a second context there is no blind critic, and the loop degenerates into self-review.

**Practical notes**
- Use the harness's parallel sub-agent facility for builders; in Claude Code that is sub-agents (and `/ultracode` for large multi-agent runs where available).
- Pick the model per role if you can: a strong reasoning model for LEAD and CRITIC, whatever is fastest and competent for mechanical BUILDER work.
- If the harness cannot spawn sub-agents, say so explicitly and downgrade to a documented single-context self-review — do not claim a gauntlet ran.

## 2. Budget

Decide before starting, and write it into the workbench:

- **Rounds:** a minimum (e.g. "at least 3 rounds per unit even if the critic passes it early") and a maximum.
- **Parallel width:** how many builders may run at once.
- **Wall-clock / token ceiling.**

A minimum round count matters: the first PASS is often the critic being lenient, not the work being done.

## 3. Parallelism

- Units that do not touch the same files or the same reader experience are **independent loops** — run them concurrently.
- Units that share state (same module, same page, same argument thread) should be **serialized**, or the smoothing pass will have to reconcile conflicting decisions.
- When builders run in parallel on the same repo, give each one an isolated working copy (a git worktree or a branch) so they do not overwrite each other.
- The critic for a unit must be spawned **fresh per round** — reusing a critic context leaks the previous round's reasoning and its previous verdict.

## 4. The progress workbench

Long runs are worth watching, but every "how's it going?" interruption costs a round. Have the LEAD maintain a live progress file the human can read asynchronously.

**`workbench.md` — minimum contents**

```markdown
# <goal> — gauntlet workbench
Bar: <the bar, verbatim>
Budget: <rounds / time / tokens>   Status: round 4 of ≤8

| Unit | Round | Verdict | Evidence | Latest artifact |
|------|-------|---------|----------|-----------------|
| token-bucket core | 3 | PASS | 5/5 required tests green | src/limiter.go |
| concurrency       | 4 | FAIL | race detector hit on refill | src/limiter.go, log/round4.txt |
| perf              | 2 | FAIL | p99 180µs vs 50µs budget | bench/round2.txt |

## Round log
- R1 perf FAIL (global mutex) → sharding proposed
- R2 perf FAIL (still 180µs) → shard count too low
...

## Open questions for the human
- (none)
```

For visual work, a self-refreshing HTML page with the latest screenshots beside the reference is better than text. Update it **after every round**, not at the end.

## 5. The smoothing pass

Improving pieces separately makes each piece better and the whole less coherent: inconsistent naming, drifting tone, mismatched spacing, duplicated helpers, two different error-handling styles.

After the loop converges, run **one fresh agent over the complete assembled result**:

- It sees the whole thing, not one unit.
- Its job is **consistency**, not redesign: unify naming/tone/spacing/structure, remove duplication, fix seams between units.
- It must not lower any unit below its bar — re-run the critical checks (tests, contrast, eval set) afterwards to confirm nothing regressed.

The smoothing pass is optional for a single-unit run and close to mandatory for anything split across five or more units.

## 6. Anti-gaming controls

The agent may find ways to clear the bar without the work actually being good. Standard defenses:

- **External references** the builder cannot forge: tests written by the critic or a third party, real screenshots, real datasets, a real PoC.
- **Blind A/B** so the critic does not know which side is the artifact.
- **Held-out checks**: the critic keeps some tests or eval cases hidden from the builder to test generalization instead of overfitting.
- **Non-negotiable criteria** that cannot be traded off (tests green, zero false positives, PoC exists, contrast passes AA).
- **The builder may not edit the bar** — changing a test or an eval case requires the LEAD and critic to agree.

## 7. Run report

At the end, output:

1. the final artifact(s),
2. the bar, verbatim,
3. the round log (what FAILed, what changed, what that produced),
4. objective PASS evidence per unit,
5. anything still below the bar and why,
6. the budget actually spent.

---
name: loop-engineering
description: >-
  Operating system for agent loops — the parent discipline that contains the
  Gauntlet Loop. Use when you need a persistent, budgeted, verifiable loop:
  maker/checker split, STATE.md durable memory, token budgets with kill-switch,
  worktree isolation, anti-gaming controls, and human gates. Complements the
  gauntlet-loop skill: gauntlet-loop decides WHAT good means (the bar); this
  skill decides HOW to run the loop safely and repeatedly. Trigger keywords:
  "loop engineering", "run this as a loop", "keep working until done",
  "budget this run", "verifier", "maker/checker", "durable loop".
---

# Loop Engineering — run agent work as a designed loop

Loop engineering is the discipline of building persistent cycles that prompt
your agents: schedule -> triage -> state -> worktree -> implementer -> verifier
-> human gate. The Gauntlet Loop (see the `gauntlet-loop` skill) is ONE pattern
inside this discipline — the quality pattern (split -> build -> blind critic ->
repeat against a real bar). This skill is the container: budgets, state,
isolation, verification, and stopping rules that make any loop safe to run
unattended.

## When to use it

- You want an agent to keep working toward an outcome without you prompting
  every step.
- You are running a Gauntlet Loop or any multi-round build/improve cycle.
- The work is long enough that cost, drift, or infinite loops are a risk.

## The loop anatomy

```
Schedule -> Triage -> STATE.md -> Worktree -> Implementer -> Verifier -> Human gate
```

Every loop needs:

1. **Objective** — the concrete outcome to make true (borrow the bar from
   `gauntlet-loop` when quality matters).
2. **Metric / bar** — the evidence used to judge each attempt (tests, benches,
   screenshots, eval, a reference artifact).
3. **Boundary** — success, safety, time, cost, and escalation conditions that
   stop the loop.
4. **State** — durable memory OUTSIDE the model context (`STATE.md`).
5. **Maker/checker split** — the implementer never grades its own work; a
   separate verifier rejects unless evidence is strong.

## Operating rules

### 1. Durable state (STATE.md)

Maintain a `STATE.md` (or `workbench.md`) at the loop root. Read it at the
start of every iteration; write outcomes at the end. Minimum contents:

```markdown
# <goal> — loop state
Bar: <the bar, verbatim>
Budget: <rounds / time / tokens>     Status: round 4 of <=8

| Unit | Round | Verdict | Evidence | Artifact |
|------|-------|---------|----------|----------|
| core  | 3     | PASS    | 5/5 tests | src/core.rs |
| perf  | 4     | FAIL    | p99 180us vs 50us | bench/r4.txt |

## Round log
- R1 perf FAIL (global mutex) -> sharding proposed
...
## Open questions for the human
- (none)
```

### 2. Budget with kill-switch

Set a budget BEFORE starting: max rounds, max parallel builders, max wall-clock
or tokens. Enforce it:

- At **>=80% of the budget** -> report-only mode (no sub-agents, no auto-fix).
- At **>=100%** or when a `loop-pause-all` flag is set -> exit immediately with
  a one-line note in STATE.md.
- If there is no actionable work, exit in <5k tokens — do NOT spawn sub-agents
  just to look busy.
- Append a run-log entry at the end of each run (round, verdict, tokens, outcome).

### 3. Maker/checker split (verifier)

The implementer and the verifier are DIFFERENT agents with separate context.
The verifier's default stance is **REJECT until proven otherwise**:

1. **Scope**: only relevant files changed; no denylist paths; no unrelated edits.
2. **Intent**: the change addresses the stated target — not a different problem.
3. **Tests**: the verifier RUNS the tests itself and pastes the output; it does
   not trust the implementer's claim.
4. **No cheating**: no disabled tests, skipped assertions, commented-out checks.
5. **Risk**: medium+ risk -> recommend human review even if tests pass.

Output: `## Verdict: APPROVE | REJECT | ESCALATE_HUMAN` + evidence + numbered
reasons on REJECT.

### 4. Isolation for parallel work

When multiple implementers touch the same repo, give each an isolated working
copy (a git worktree or a branch) so they do not overwrite each other. Merge
back only through the verifier.

### 5. Anti-gaming controls

- **External references** the implementer cannot forge (tests written by the
  verifier or a third party, real screenshots, real datasets).
- **Blind A/B** so the verifier does not know which side is the artifact.
- **Held-out checks**: the verifier keeps some tests/eval cases hidden from the
  implementer to test generalization, not overfitting.
- **Non-negotiable criteria** that cannot be traded off (tests green, zero
  false positives, contrast passes).
- **The implementer may not edit the bar** — changing a test or an eval case
  requires the verifier and the human to agree.

### 6. Human gates outrank the loop

"Keep going until perfect" never self-approves a sign-off. Anything involving
credentials, spend, production promotion, or irreversible mutation escalates to
the human and the loop pauses there.

## Relationship to gauntlet-loop

| Concern | Use |
|---------|-----|
| What "good" means (the bar) | `gauntlet-loop` skill |
| Blind critic of the real artifact | `gauntlet-loop` (critic design) + this skill's verifier rules |
| Budget, kill-switch, run-log | This skill (budget.md) |
| Durable state / workbench | This skill (state.md) |
| Isolation, worktrees | This skill |
| Stopping rules | Both — stop when bar met, 2 rounds no improvement, budget spent, or human stops |

## Expected output

Working artifact + STATE.md showing per-unit verdicts and evidence + run-log
with budget actually spent + anything still below the bar and why.

---
description: Lanza un Gauntlet Loop (método de Matt Shumer) — objetivo ambicioso + bar real + subagentes builder/crítico ciego + loop hasta superar el bar o que el humano pare.
agent: build
---

I want to run a Gauntlet Loop for this goal:

$ARGUMENTS

You are the LEAD agent of this loop. Follow the Gauntlet Loop method (Matt Shumer, https://somethingbig.ai/gauntlet-loop):

1. BAR: Pick the strongest concrete bar that can be inspected and compared against — a real reference (a test suite, a benchmark, a reference implementation, screenshots of a top product, an eval set, a latency target). If none is obvious, FIRST find one and explain it in one sentence before building. "Make it great" is NOT a bar.
2. SPLIT: Divide the goal into the smallest pieces that can be improved and judged independently. Decide the decomposition yourself.
3. LOOP PER PIECE: For each important piece, spawn a FRESH @gauntlet-builder subagent via the task tool to build/fix it, then spawn a FRESH @gauntlet-critic subagent (new context, never the same critic twice) to inspect the REAL artifact against the bar. The critic never sees the builder's reasoning. If FAIL, feed the single biggest gap back to a new builder round. Keep looping piece by piece.
4. PARALLELIZE: run independent pieces in parallel where possible.
5. SMOOTH: after each wave, spawn @gauntlet-smoother once to integrate and harmonize.
6. PROGRESS: maintain a live `workbench.md` in the repo root — current round, per-piece PASS/FAIL, evidence, links to artifacts. Update it after every round.
7. KEEP GOING: no arbitrary round limit. Stop only when (a) the artifact beats the bar, (b) two consecutive rounds produce no improvement, or (c) I tell you to stop.

For visual artifacts, use browser/screenshot MCP tools if available so the critic inspects real pixels. The user is the brake — never self-approve a sign-off.

# Domain: Coding — building and refactoring software to a high bar

> This is the **original application** of the Gauntlet Loop in Matt Shumer's article (building software and games to AAA quality). This file covers **how to pick the bar for code**, the **test-as-bar** technique, and a worked example.

## When to use it

You are building a feature, component, library, or algorithm and want to iterate until it **matches or beats a reference and clears a quality bar** — instead of shipping the first version that runs.

## Choosing the bar for code

Pick at least one **reference** plus measurable criteria:

- **Reference implementation (strong):** an existing library, product, or competitor doing the same job. The artifact must **match or beat** it on correctness, speed, or size.
- **Test-as-bar (strongest):** a suite of tests — unit, edge case, property-based where it fits — defined by the **critic or a third party**. A red required test is a FAIL, no matter how good the code looks.
- **Performance budget:** concrete numbers — p95/p99 latency, bundle size, memory, query count, allocations.
- **UX quality (if it has UI):** blind A/B of screenshots against a reference product — see `design.md`.
- **Cleanliness:** no linter errors, complexity under a threshold, real error handling, edge cases covered.

**Non-negotiable:** required tests green, and no regressions in the existing suite.

## Mapping onto the loop

1. **LEAD** splits by module, flow, or quality dimension (core logic / edge cases / performance / UI). Sets the bar and the required tests.
2. **BUILDER** (clean context) implements a unit; the artifact is **running code**.
3. **CRITIC** (blind) **runs the code and the tests for real**, measures performance, screenshots the UI, compares to the reference. PASS only when required tests are green, the numbers clear the budget, and (for UI) the blind A/B ties or wins.
4. **Fix and repeat:** feed red tests and losing numbers back; go deeper on edge cases; run more rounds than feel necessary.

## What the critic must do

- Run the test suite and paste the actual output (pass/fail, coverage).
- Run the benchmark and paste the actual numbers.
- For UI: open it, screenshot it, compare against the reference.
- Attack it with hostile inputs — null, empty, negative, overflow, unicode, very large, concurrent, I/O failure. Light fuzzing where it fits.

---

## Test-as-bar

The strongest bar for code is **a test suite the builder is not allowed to edit into passing**. Red test = FAIL, not negotiable.

### Rules
1. **Tests are defined by the critic or a third party**, never by the builder for its own code — a builder writes tests that fit its bugs.
2. **Cover edge cases**, not the happy path: null/empty, negative, numeric overflow, unicode, very large input, concurrency, I/O errors.
3. **100% of required tests must be green.** Nice-to-have tests can be a separate group.
4. **No regressions:** existing tests stay green as features are added.
5. Where it fits, add **property-based tests** (generated inputs) and light fuzzing to find cases nobody thought of.

### Process
- **LEAD** and the critic write out the expected behaviors and turn them into tests. Freeze the "required" set.
- **BUILDER** implements against them. It can see the test names but **may not modify the tests**.
- **CRITIC** (blind) runs the tests for real, pastes the output, then tries **held-out inputs the builder never saw**. PASS only when required tests are green and it cannot break the code further.

### Test table template

```
| # | Group        | Input                   | Expected              | Required |
|---|--------------|-------------------------|-----------------------|----------|
| 1 | happy        | "1h30m"                 | 5400                  | yes      |
| 2 | edge:zero    | "0s"                    | 0                     | yes      |
| 3 | edge:negative| "-5m"                   | error                 | yes      |
| 4 | edge:overflow| "999999999999h"         | no crash, clear error | yes      |
| 5 | invalid      | "abc"                   | error                 | yes      |
| 6 | unicode      | "1ｈ" (fullwidth)       | error or normalized   | no       |
```

### Anti-gaming
- The builder **may not change tests**. Changing an expectation requires the LEAD and the critic to agree.
- The critic keeps **held-out tests** hidden from the builder to check generalization.
- Track coverage, but never make coverage the goal — high coverage coexists happily with wrong logic. Pair it with property tests and fuzzing.

### Combine with other bars
Test-as-bar covers **correctness**. Add a **performance** bar (real benchmark numbers) and a **cleanliness** bar (linter, complexity) for overall quality.

---

## Worked example — `parseDuration`

> Test-as-bar in action: LEAD defines the tests, BUILDER implements, CRITIC runs them for real, finds failures, and the unit passes in round 2.

### Goal
`parseDuration(s: string): number` — convert a duration string ("1h30m", "45s") to **seconds**. Bar: **all required tests green** + no crash on bad input.

### Round 1 — LEAD (bar + split + tests)

```
1 "1h30m"           → 5400        (required)
2 "45s"             → 45          (required)
3 "0s"              → 0           (required)
4 "-5m"             → throws      (required)
5 "999999999999h"   → no crash    (required)
6 "abc"             → throws      (required)
```

One unit (small function). Assigned to a builder.

### Round 1 — BUILDER (clean context)

```js
function parseDuration(s) {
  const re = /(\d+)([hms])/g;
  let total = 0, m;
  while ((m = re.exec(s)) !== null) {
    const n = parseInt(m[1], 10);
    total += m[2] === 'h' ? n*3600 : m[2] === 'm' ? n*60 : n;
  }
  return total;
}
```

Builder note: "happy path looks fine; unsure about negative and invalid input."

### Round 1 — CRITIC (blind) runs the tests for real

```
1 "1h30m"          → 5400   PASS
2 "45s"            → 45     PASS
3 "0s"             → 0      PASS
4 "-5m"            → 0      FAIL  (expected an error; the regex ignores '-' and returns 0)
5 "999999999999h"  → 3.6e15 WARN  (no crash, but past safe-integer range — silent precision loss)
6 "abc"            → 0      FAIL  (expected an error; silently returns 0 and swallows bad input)
```

**Verdict: FAIL.** Losses: (a) unmatched input returns 0 instead of erroring (test 6); (b) negative sign silently dropped (test 4); (c) integer-safety overflow (test 5). Fixes: validate the whole string against the pattern; reject a negative sign; check `Number.isSafeInteger`.

### Round 2 — BUILDER revises

```js
function parseDuration(s) {
  if (typeof s !== 'string' || !/^(\d+[hms])+$/.test(s.trim()))
    throw new Error(`invalid duration: ${s}`);        // tests 4, 6
  const re = /(\d+)([hms])/g;
  let total = 0, m;
  while ((m = re.exec(s)) !== null) {
    const n = Number(m[1]);
    total += m[2] === 'h' ? n*3600 : m[2] === 'm' ? n*60 : n;
    if (!Number.isSafeInteger(total))
      throw new Error('duration too large');           // test 5
  }
  return total;
}
```

### Round 2 — CRITIC (blind) reruns + held-out inputs

```
1..6 → all PASS (negative and invalid now throw; overflow throws a clear error)
held-out: ""      → throws  PASS
held-out: "1h1h"  → 7200    PASS (repetition accepted; noted, not a bug)
held-out: "1H"    → throws  PASS (lowercase-only is a consistent, defensible decision)
```

**Verdict: PASS** — every required test green, no further breakage found.

### Outcome
- Cleared the bar in round 2. Log: round 1 FAIL (swallowed bad input + overflow) → round 2 added validation and a safe-integer check → PASS.
- Raising the bar further: support `d` for days, allow whitespace, add property-based tests generating valid random strings to check compositionality.

> A longer example with a performance bar (rate limiter, p99 budget): `../../../../examples/example-coding-run.md`.

## Output

Final code + **real test results** + performance numbers + (for UI) screenshots against the reference + the round log (which test went red → what changed).

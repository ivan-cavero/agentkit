# Domain: Prompts, Agents and Skills — eval-as-bar

> How to pick the **bar for LLM-facing work** — prompts, agent instructions, skills, tool descriptions, LLM features — plus a worked round. The bar is a **fixed eval set** and a **head-to-head against the current baseline**.

## When to use it

You are writing or tuning something a model reads: a system prompt, an agent's instructions, a skill, a tool description, a classification or extraction prompt. The failure mode is a change that looks better in the one example you tried and is worse everywhere else.

## Choosing the bar (eval-as-bar)

1. **A fixed eval set** of at least 20–30 cases — ideally drawn from real inputs, including the hard and weird ones, not cases invented to make the prompt look good. Each case has an input and a checkable expectation (exact match, contains, schema-valid, a rubric score, or a judge model with a rubric).
2. **A baseline:** the current prompt, or the obvious naive prompt. The new version must **beat the baseline** on the eval set, not merely score well in isolation.
3. **No regressions:** cases the baseline passed must not start failing. A net gain that breaks previously-working cases is a FAIL unless it is an explicit, accepted trade.
4. **Budget:** tokens, latency, and cost per call must stay within stated limits — a prompt that wins by tripling the context is often not a win.

**Non-negotiable:** the eval set is **frozen before building**, and the builder may not edit it. Held-out cases the builder never sees are the primary defense against overfitting.

## Mapping onto the loop

- **LEAD:** defines the task, freezes the eval set (with a held-out split), records the baseline scores, and splits by failure mode (e.g. ambiguous inputs / formatting / refusals / long inputs).
- **BUILDER:** revises the prompt or skill; the artifact is the **actual prompt text**, runnable against the eval set.
- **CRITIC (blind):** **runs the eval set for real** on both the new version and the baseline, reports per-case results and the diff, then runs the **held-out** cases. PASS only when it beats the baseline, has no unaccepted regressions, and stays in budget.

## What the critic must do

- **Run the evals** — never estimate how a prompt "would probably" behave.
- Report **head-to-head per case**, not just an aggregate: which cases flipped to passing, which flipped to failing.
- Run the **held-out split** to detect overfitting to the visible cases.
- Run each case **more than once** where the task is nondeterministic, and report variance — a one-run improvement inside the noise band is not an improvement.
- Check **cost and latency**, and check that the prompt does not win by hard-coding answers to eval cases.

## Common failure modes this catches

- **Overfitting:** the prompt is patched case-by-case until the visible set passes and the held-out set collapses.
- **Instruction bloat:** every round adds a rule; the prompt doubles in length and the model starts ignoring the middle.
- **Silent regressions:** fixing formatting breaks the reasoning cases nobody re-ran.
- **Vibes-based evaluation:** "this reads better" without a single execution.

---

## Worked example — an extraction prompt

### Goal
Extract `{vendor, amount, date}` from invoice text as JSON. Bar: beat the baseline prompt on a frozen 40-case eval set (30 visible, 10 held out), zero schema-invalid outputs, no regressions, ≤ 1.5× baseline tokens.

### Round 1 — BUILDER
Rewrites the prompt with detailed formatting rules and three few-shot examples.

### Round 1 — CRITIC (blind) runs the evals

```
Baseline:  24/30 visible   schema-invalid: 3   avg tokens: 480
New:       28/30 visible   schema-invalid: 0   avg tokens: 1310
Held-out:  6/10  (baseline: 8/10)              <-- regression
Per-case diff: +6 fixed, -2 broken (both are multi-currency invoices)
```

**Verdict: FAIL.** Wins on the visible set but **loses on held-out** — the few-shot examples were drawn from the visible cases and pushed the model toward their formats. Also 2.7× baseline tokens, over the budget. Fixes: use examples that are not from the eval set, state the multi-currency rule explicitly instead of demonstrating it, and cut the redundant formatting rules.

### Round 2 — BUILDER revises
Replaces the few-shots with two synthetic examples covering formats absent from the eval set, adds one explicit currency rule, and removes duplicated formatting instructions.

### Round 2 — CRITIC (blind) reruns

```
New v2:    28/30 visible   schema-invalid: 0   avg tokens: 690
Held-out:  9/10  (baseline: 8/10)
3 runs per case: variance ±1 case — the gain is outside the noise band
```

**Verdict: PASS** — beats the baseline on both splits, no schema errors, within the token budget.

## Output

The final prompt + the **eval results table** (new vs baseline, visible and held-out, per case) + variance across runs + token/latency/cost numbers + the round log of what was tried and what it did.

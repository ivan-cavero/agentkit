# Gauntlet Loop — the full method (domain-agnostic)

> **Origin:** the Gauntlet Loop is a prompting method by **Matt Shumer**, described in *"How to Run a Gauntlet Loop: The Prompting Method Behind Claude of Duty"* (https://somethingbig.ai/gauntlet-loop), with the companion repo `mshumer/Claude-of-Duty` (https://github.com/mshumer/Claude-of-Duty). This document is an independent restatement and generalization, attributed and paraphrased rather than copied. The original article illustrates the method mainly through **building software and games**.

---

## 1. The core intuition

Excellent output rarely comes from one attempt. The Gauntlet Loop turns "make it good" into a disciplined process:

1. **Set a bar the agent cannot reason its way past.** The strongest form forces the artifact to **beat something real**, not to satisfy the model's own opinion of itself.
2. **Let the agent split the goal** into the smallest pieces that can be improved and graded independently.
3. **Never let the builder grade itself.** A separate critic, in a clean context, blind to the builder's reasoning, inspects the **real artifact**.
4. **Keep looping.** Most runs are stopped several rounds too early.

All of this presumes a **real agent harness** — one that can open files, run code, render results, inspect screenshots, use tools, change things, and spawn sub-agents. Pasting a Gauntlet Loop into a plain chat window does not work: there is no second context, so there is no independent critic.

## 2. The three roles and the context rule

| Role | Job | Sees | Forbidden |
|------|-----|------|-----------|
| **LEAD** | Split the goal, set the bar, orchestrate, merge | The whole picture | Building any part itself (it would then be judging its own work) |
| **BUILDER** | Build one part → produce an artifact | Its assigned part and its resources | Declaring PASS |
| **CRITIC** (blind) | Grade the artifact against the bar, demand evidence | Only the artifact + the bar | Passing anything that has not cleared the bar |

**Why the critic must be blind:** a model is very good at explaining why its own work is reasonable. A critic that reads the builder's justification gets anchored and agrees. A clean context forces it to re-derive its judgment from the artifact itself.

## 3. The bar — the heart of the method

A good bar is **concrete**, **inspectable**, and **anchored to something real**. It does **not** have to be realistically reachable; an aspirational bar keeps pulling the work upward instead of letting it settle at "good enough".

Examples by kind of work (details in `choosing-the-bar.md`):

- **Coding:** match or beat a **reference implementation** + a **green test suite** + a latency/bundle budget.
- **Writing:** reach the clarity and tightness of a **model text** (e.g. a Paul Graham essay as a clarity standard).
- **Design:** win or tie a **blind A/B** of screenshots against a best-in-class product.
- **Games/graphics:** hold up next to screenshots or footage from a AAA title.
- **Data:** independently recomputed, robust to assumptions, reproducible end-to-end.
- **Research:** every claim traceable to a real, retrievable source.
- **Prompts/agents:** beat a baseline on a fixed eval set.
- **Detection:** fire on the target **MITRE ATT&CK** technique **and** produce zero false positives on benign logs.
- **Security:** a working, non-destructive **PoC**.

If no reference is obvious, the first task in the loop is **"find a concrete comparison or measurement"** — not "start building".

## 4. The loop in detail

```
LEAD.split → [BUILDER × N] → CRITIC(blind) → grade(bar) → LEAD.merge → repeat → SMOOTHER
```

1. **Bar and budget.** Fix the bar and the loop budget (minimum rounds, or an explicit stop condition).
2. **Split (LEAD).** Break into the smallest independently gradeable units. Independent units become parallel loops.
3. **Build (BUILDER × N, parallel, clean contexts).** Each builder produces a real artifact.
4. **Critique (CRITIC, blind).** Grade against the bar with evidence; prefer a blind A/B with the reference where the domain allows it. Return PASS/FAIL + specific fixes.
5. **Fix and repeat.** Feed FAILs back. Go deeper on the hard parts; split them further; try variants.
6. **Smooth.** A single fresh agent inspects the assembled whole and fixes inconsistencies introduced by improving pieces separately. It harmonizes; it does not redesign.
7. **Report.** Final artifact, round log, PASS evidence, remaining gaps.

## 5. What "run it longer" means in practice

- Do not stop at "good enough" — stop when it stops improving or the budget runs out.
- Split the hard parts further: one UI element, one paragraph, one hot function.
- Make the critic try **more than one way to refute** before it passes anything.
- Revisit the units the LEAD marked "uncertain".
- Watch progress through the workbench instead of interrupting the loop to ask.

## 6. Stop conditions

- Every unit clears the bar; **or**
- two consecutive rounds show no improvement against the bar; **or**
- the round/time/token budget is exhausted.

Always record what remains below the bar. Because the bar can be deliberately unreachable, "never reached the bar" is a normal, reportable outcome — not a failure of the run.

## 7. Common failure modes

- **Builder and critic share context** → the blind critic collapses into a rubber stamp.
- **Vague bar** ("make it nicer") → the agent grades itself generously.
- **Critic reads the summary instead of the artifact** → passes work it never inspected.
- **Prescribing the implementation** → caps the result at your own imagination.
- **Stopping too early** → the single most common mistake.
- **No round log** → you cannot reproduce or explain why the result is good.
- **Running it in a plain chat** → no sub-agents, no independent critic, no loop.

## 8. When not to use it

Small, one-off, low-stakes work. The loop multiplies cost and wall-clock time; spend it where quality actually matters and where you can name something real to measure against.

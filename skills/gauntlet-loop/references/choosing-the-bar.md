# Choosing the Bar

The bar is what separates a Gauntlet Loop from "just try harder". A good bar is:

- **Concrete** — it says exactly what counts as clearing it. "Make it nicer" is not a bar.
- **Inspectable** — someone (or something) can check it objectively: a test run, a measurement, a blind A/B, a working PoC.
- **Anchored to something real** — the strongest bars force the artifact to **match or beat a thing that actually exists**, instead of satisfying the model's own opinion of its work.

A bar **does not have to be realistically reachable**. An aspirational bar ("hold up next to a AAA title", "read like a Paul Graham essay") keeps the loop pulling upward. You stop when improvement stops or the budget runs out, not necessarily when the bar is met.

## Four questions that produce a bar

1. **What is the reference?** The best comparable thing that exists: a competing library, a top product's UI, a model essay, a published method, a curated eval set, an attack technique.
2. **What are the criteria?** Two to five, each one measurable. Mark which are **non-negotiable**.
3. **How is each one checked objectively?** Name the check, not the feeling: "required tests green", "p99 < 50µs at 100k ops", "blind A/B ties or wins 3 of 5", "contrast ≥ 4.5:1", "zero hits on 30 days of benign logs".
4. **What is the stop condition?** Bar cleared, or two rounds with no improvement, or budget exhausted.

**If you cannot name a reference, the first task of the loop is to find one.** Tell the agent: *"Before building anything, find a concrete comparison or measurement for this goal and propose it as the bar."* Building against a vague target wastes the whole run.

## Bar patterns by kind of work

| Work | Reference | Criteria | Objective check |
|------|-----------|----------|-----------------|
| **Coding** | Reference implementation / competing API | correctness, edge cases, performance, cleanliness | test suite green, benchmark numbers, linter/complexity |
| **Writing** | A model text you consider the clarity standard | clarity, tightness, structure, voice, factual accuracy | blind A/B against the model text, delete-the-word test, fact check |
| **Design/UI** | Screenshot of a best-in-class product of the same type | hierarchy, rhythm, typography, color, consistency, states | blind A/B of screenshots, contrast measurement, breakpoint checks |
| **Data/analysis** | Standard method or a known result | correctness, robustness, reproducibility | independent recomputation, sensitivity analysis, rerun from raw |
| **Research** | Primary sources | every claim sourced, sources real and retrievable, contrary evidence covered | open every citation, verify the claim appears in it |
| **Prompts/agents** | A baseline prompt + a fixed eval set | pass rate, regressions, cost/latency | run the eval set, held-out cases, head-to-head vs baseline |
| **Detection** | The target MITRE ATT&CK technique | fires on attack data, zero false positives on benign data | run the rule on both datasets |
| **Security** | The real vulnerability class + standards | exploitable, CWE-mapped, precedent exists | a working non-destructive PoC |

## Layering bars

One bar rarely covers quality. Combine:

- a **correctness** bar (tests, recomputation, PoC),
- a **quality/aesthetic** bar (blind A/B against the reference),
- a **budget** bar (latency, size, cost, query time),
- and a **non-negotiable** floor (accessibility, safety, zero-FP).

## Anti-gaming

The agent may clear a bar without the work being good. Defenses:

- Use **external references** it cannot forge: tests it did not write, real screenshots, real data, a real PoC.
- Run **blind A/B** so the critic does not know which side is the artifact.
- Keep **held-out checks** the builder never sees.
- Make the critical criteria **non-negotiable** — no trading a red test for a nicer API.
- **The builder may not edit the bar.** Changing a test or an eval case requires the LEAD and the critic to agree.

## Raising the bar mid-run

It is fine to start at "match the reference" and move to "beat it on dimension X" once the first bar is cleared. Record the bar used in each round so the progress log stays interpretable.

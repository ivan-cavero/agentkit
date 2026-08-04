# Domain: Data Analysis — results you can actually rely on

> How to pick the **bar for analysis** plus a worked round. Iterate until a blind critic confirms the result is **correct, robust, and reproducible**.

## When to use it

You need an analysis, metric, model, or experiment readout that a decision will rest on — rather than a number that came out of one run of one notebook.

## Choosing the bar for analysis (three axes, all required)

1. **Correctness:** an **independent recomputation** reaches the same number. The critic re-derives the calculation or query **from the definition**, without copying the builder's code. A discrepancy is a FAIL.
2. **Robustness:** the conclusion does not flip under reasonable changes to assumptions, parameters, or outlier handling (**sensitivity analysis**). If a small assumption change reverses it, that must be stated prominently, not hidden.
3. **Reproducibility:** the pipeline **reruns end to end from raw data** and produces the same result — fixed seed, deterministic steps, recorded data version.

Recommended on top: an unambiguous metric definition (numerator, denominator, time window, filters), a data-quality check (nulls, duplicates, type and unit errors), and no cherry-picked windows.

## Mapping onto the loop

- **LEAD:** states the question, the metric definition, and the data sources; splits into steps (cleaning / transformation / modeling / interpretation).
- **BUILDER:** performs the analysis; the artifact is a **runnable notebook or script** plus tables, charts, and a conclusion.
- **CRITIC (blind):** **recomputes independently**, runs **sensitivity**, **reruns from raw**, and audits data quality and definitions. PASS only on all three axes.

## The loop

1. LEAD fixes the question, the metric, the three-axis bar, and the data.
2. BUILDER runs the analysis, documenting every assumption and processing step.
3. CRITIC (blind):
   - **Recompute:** rewrite the calculation from the definition — in a different tool or language if possible — and compare numbers.
   - **Sensitivity:** change the outlier threshold, the time window, the imputation method. Does the conclusion hold?
   - **Reproduce:** rerun from raw data with a fixed seed.
   - **Data QA:** nulls, duplicates, types, units, leakage, ambiguous metric definitions.
4. FAIL → the builder fixes the calculation bug, the weak assumption, or the missing reproducibility. Repeat.
5. Report: the result with its uncertainty range, the sensitivity results, and reproduction instructions.

## What the critic must do

- **Do not trust the builder's number** — recompute it independently and compare.
- Actually run the sensitivity analysis and the rerun; paste the numbers.
- Trace every processing step. Catch data leakage, unit errors, wrong denominators, and cherry-picked time windows.

---

## Worked example — "conversion is up 20%"

The builder reports "conversion rose 20% after the change". The blind critic:

- **Recompute from raw:** the builder's figure was computed on a filtered set that silently excluded mobile users. Recomputed over everything: **+6%**.
- **Sensitivity:** computed week by week rather than over the whole period, the lift ranges from 2% to 9% — the 20% figure is not stable.
- **Verdict: FAIL** (correctness and robustness).

The builder revises: states the filter explicitly, reports +6% with a confidence interval, and documents the week-to-week variance → **round 2 PASS**.

## Output

The result + the method + the **independent verification** + the **sensitivity analysis** + **reproduction instructions** (data version, seed, environment) + the limitations and assumptions.

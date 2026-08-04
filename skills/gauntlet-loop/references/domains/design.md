# Domain: Design — UI and visual work to top-product polish

> How to pick the **bar for design** plus a worked round. Iterate a screen or component until a **blind A/B of screenshots** rates it at or above a best-in-class reference product.

## When to use it

Building UI, landing pages, components, or graphics where you want the polish of a leading product rather than "looks okay".

## Choosing the bar for design

Pick a **screenshot of a reference product** of the same type, plus criteria:

- **Visual hierarchy:** the eye knows where to go first; the primary action stands out.
- **Rhythm and spacing:** a consistent spacing scale; nothing cramped or misaligned.
- **Typography:** a clear size and weight scale; readable line length and line height.
- **Color and contrast:** a coherent palette; sufficient contrast (WCAG AA).
- **Consistency:** buttons, forms, and states behave the same everywhere.
- **Usability:** hover, focus, empty, loading, and error states are all designed.

**Non-negotiable:** contrast meets AA; the primary action is unmistakable; the layout does not break at the main breakpoints.

## Mapping onto the loop

1. **LEAD** sets the bar (reference screenshot + criteria) and splits by concern (layout / typography / color / component / states).
2. **BUILDER** builds real UI; the artifact is a **rendered page**, not a description.
3. **CRITIC** (blind) **renders and screenshots it for real**, places it beside the reference in a **blind A/B**, grades each criterion, measures contrast, and exercises every state. PASS when it ties or wins the A/B and meets the non-negotiables.
4. **Fix and repeat:** spacing, color, hierarchy. Several rounds.

## What the critic must do

- **Screenshot the artifact** at multiple breakpoints — never grade from a description.
- **Blind A/B:** hide which image is the artifact and which is the reference; ask which looks more polished and why.
- **Measure contrast** (AA) and exercise focus, hover, empty, loading, and error states for real.
- Be specific: "card gutter is 12px, off the 8/16/24 scale", "the CTA disappears because it is the same tone as the background".

---

## Worked example — a pricing card

> Bar = blind A/B of screenshots against a reference SaaS product; the critic renders it rather than reading a description.

### Goal
The "Pro" card on a pricing page. Bar: a blind A/B of screenshots **ties or beats** the reference product's pricing card; **the CTA is prominent and passes AA contrast**.

### Round 1 — BUILDER (what it rendered)
- White card, 1px grey border. Title "Pro" at 16px, the same size as the price "$29".
- Five features in a list, tightly stacked (line-height 1.2).
- "Choose Pro" button: light grey background `#E5E7EB`, grey text `#6B7280`.

### Round 1 — CRITIC (blind) renders, screenshots, runs the A/B
- **Blind A/B:** judges picked the reference as more polished 5 times out of 5. Reasons recorded:
  - **Weak hierarchy:** `$29` is no bigger than the "Pro" label (both 16px), so the eye never lands on the price.
  - **Cramped rhythm:** line-height 1.2 makes the feature list feel dense; the reference uses ~1.6 with 8/16 spacing.
  - **CTA disappears:** grey on white measures **~2.3:1, below the 4.5:1 AA floor** — it reads as disabled.
- **Verdict: FAIL.** Losses: price hierarchy, spacing, and the CTA (both aesthetically and on contrast). Fixes: scale up the price and change its weight; move spacing onto an 8/16/24 scale; make the CTA a solid brand color with white text that clears AA.

### Round 2 — BUILDER revises
- Price `$29` at 40px bold, "/mo" at 14px grey; "Pro" label at 14px uppercase with letter-spacing.
- List at line-height 1.6, 12–16px vertical spacing, brand-colored check icons.
- CTA: solid `#2563EB` with white `#FFFFFF` text → contrast **~8:1 (passes AA and AAA)**; darker hover; visible focus ring.

### Round 2 — CRITIC (blind) re-renders, re-runs the A/B, measures
- **Blind A/B:** wins or ties the reference 3 of 5, ties 2 of 5 → meets "ties or beats".
- **Contrast:** CTA ~8:1, body text ~7:1 → AA passes.
- **States:** hover and focus are clear; the card does not break at the mobile breakpoint.

**Verdict: PASS** — clears the A/B bar and both non-negotiables.

### Outcome
- Round 1 FAIL (hierarchy + spacing + CTA/AA) → round 2 fixes → PASS.
- Screenshots from both rounds, the A/B split, and the contrast numbers are kept as PASS evidence.
- Raising the bar: micro-interactions, dark mode, or A/B against two more reference products.

## Output

Final UI + **screenshots beside the reference** + the blind A/B result + contrast and state checks + the round log.

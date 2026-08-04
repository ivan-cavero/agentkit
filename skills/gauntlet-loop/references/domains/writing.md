# Domain: Writing — writing to the clarity of a model text

> How to pick the **bar for writing** plus a worked editing round. Iterate a draft until it reaches the clarity and tightness of a **reference text**.

## When to use it

Essays, blog posts, documentation, launch announcements, investor updates, important internal messages — anything where you want a high standard rather than a serviceable first draft.

## Choosing the bar for writing

Pick a **model text** — a piece you consider the standard for clarity in this genre — plus measurable criteria:

- **Clarity:** the target reader understands it on the first pass; no ambiguous sentences.
- **Tightness:** if a word can be deleted without changing the meaning, it must be deleted.
- **Structure:** one clear main point; paragraphs that follow each other; a strong opening and close.
- **Voice and audience:** written for a specific reader; no filler, no clichés, no "AI-ese".
- **Accuracy:** every claim supported; no invented numbers or sources.

**Non-negotiable:** no filler sentences, no false statements, right audience.

> A common clarity standard is the Paul Graham essay style (paraphrased, not quoted): write as if speaking to one intelligent person; short sentences; concrete points; cut everything that does not serve the main idea.

## Mapping onto the loop

1. **LEAD** sets the bar (model text + criteria) and splits by section (opening / argument 1..n / close) or by criterion (clarity / tightness / structure).
2. **BUILDER** writes or revises a unit; the artifact is a **full draft**, not an outline.
3. **CRITIC** (blind) reads the draft, runs a **blind A/B** against the model text on each criterion, marks filler and vague sentences, and fact-checks. PASS only when every non-negotiable criterion is met.
4. **Fix and repeat:** cut, clarify, restructure. Several rounds.

## What the critic must do

- **Blind A/B:** put a passage of the draft next to a passage of the model text with labels hidden and ask which is clearer and tighter, and why.
- **Delete-the-word test:** strike every word that can be removed without changing the meaning. Many strikeable words = not tight.
- **Read it aloud** to catch sentences that stumble or run long.
- **Fact-check** every number, source, and claim. Invented citations are an automatic FAIL.
- Name specifics: "paragraph 3 buries the main point in the last sentence", not "could be tighter".

---

## Worked example — an opening paragraph

> Bar = the clarity and tightness of a model text; the critic runs a blind A/B plus the delete-the-word test.

### Goal
An opening paragraph for an internal post on "why we chose a message queue". Bar: as clear and tight as the reference essay; **no filler, no clichés**.

### Round 1 — BUILDER (draft)

> "In today's rapidly evolving technology landscape, choosing an appropriate infrastructure solution is an extremely important and necessary consideration that any organization should carefully evaluate. It is for this reason that we have made the decision to utilize a message queue in order to address the various issues relating to the handling of load."

### Round 1 — CRITIC (blind): A/B + delete-the-word

- **Blind A/B** against the model paragraph: the draft **loses clearly** on tightness — it opens on a cliché ("today's rapidly evolving technology landscape") and is padded throughout.
- **Delete-the-word test:** large amounts strike out with no loss of meaning — "extremely important and necessary", "carefully evaluate", "in order to", "the various issues relating to the handling of".
- The actual point (why a message queue) is buried in the last clause and stays vague — load of what? which problems?

**Verdict: FAIL.** Losses: roughly half the words are filler; opens on a cliché; the main point is not concrete. Fixes: drop the cliché, name the specific problem, move the point to the front.

### Round 2 — BUILDER (revision)

> "Our payments service gets hit in bursts: thousands of requests arrive in a few seconds, then it goes quiet. Handling them synchronously left requests hanging until they timed out. We put a message queue in front to absorb the bursts and drain them steadily — that is the decision this post explains."

### Round 2 — CRITIC (blind) re-checks

- **Blind A/B:** now **ties** the model text on tightness; sentences are short and concrete.
- **Delete-the-word test:** almost nothing can be cut without losing meaning.
- The main point (absorbing bursts) is in the first sentence and specific (payments, thousands of requests in seconds, timeouts).
- **Fact-check:** the numbers are marked as illustrative rather than presented as measurements — acceptable.

**Verdict: PASS** — clarity and tightness bar met, no clichés, point up front.

### Outcome
- Round 1 → round 2 cut roughly 40% of the words, moved the point to the front, and replaced clichés with specifics.
- The log lets you apply the same standard to the body and the conclusion.

## Output

Final text + a round log (what was cut or rewritten and why) + the criterion-by-criterion check against the bar.

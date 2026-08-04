# Domain: Research — findings that survive a hostile fact-check

> How to pick the **bar for research** plus a worked round. Use for literature reviews, market and competitive research, technology evaluations, and due diligence — anywhere a fabricated or misread source would be expensive.

## When to use it

Someone will make a decision based on your summary of what is true out there. The failure mode is not "the writing is weak" — it is **confident claims backed by sources that do not say that, or do not exist**.

## Choosing the bar for research (three required criteria)

1. **Every claim is sourced.** Each substantive statement carries a citation to a **primary or authoritative** source, not to another summary.
2. **Every source is real and says what is claimed.** The critic must be able to open the source and find the claim in it. A dead link, a paraphrase the source does not support, or an invented citation is an automatic FAIL.
3. **Contrary evidence is represented.** The strongest disagreeing source is named and addressed, not omitted. A one-sided brief on a contested question fails even if every citation checks out.

Recommended on top: date the evidence (how current is this?), separate **fact / consensus / the author's inference**, and note where evidence is thin rather than smoothing over it.

## Mapping onto the loop

- **LEAD:** states the question precisely, defines what a good answer must cover, and splits by sub-question or by source type (primary literature / vendor docs / market data / practitioner reports).
- **BUILDER:** researches one sub-question; the artifact is a **claim table** — claim, source URL, exact supporting quote or data point, confidence.
- **CRITIC (blind):** **opens every source** and verifies the claim appears in it; searches independently for contrary evidence; checks recency. PASS only on all three axes.

## What the critic must do

- **Open every citation.** Do not accept a claim because the URL looks plausible — fetch it and locate the supporting passage.
- **Search for the counter-case** independently: "evidence against {claim}", the strongest critic of the position, the failed version of the trend.
- Check **dates**: is this the current state, or a snapshot from three years ago presented as current?
- Distinguish **the source's claim from the builder's inference** — inference is allowed, but it must be labeled.
- Flag **circular sourcing**: three articles all citing the same original press release is one source, not three.

---

## Worked example — "is technology X production-ready?"

### Round 1 — BUILDER
Delivers a brief: "X is production-ready; adoption is growing rapidly [1][2]; the main limitation is cost [3]."

### Round 1 — CRITIC (blind) opens the sources
- **[1]** is a vendor blog post announcing X — a marketing claim, not evidence of production readiness. **Not an independent source.**
- **[2]** exists and is independent, but is dated 26 months ago and its own conclusion is "promising, early". The brief presents it as current.
- **[3]** does not contain the cost figure quoted. The number appears nowhere in the linked page. **Unverifiable citation.**
- **Independent counter-search:** two recent practitioner write-ups report a serious operational limitation the brief never mentions.

**Verdict: FAIL** on all three axes: non-primary sourcing, stale evidence presented as current, one unverifiable citation, and missing contrary evidence.

### Round 2 — BUILDER revises
Replaces the vendor post with two independent deployments, dates every source inline, drops the unverifiable cost figure and replaces it with a sourced range, and adds a "known limitations" section covering the operational issue with citations.

### Round 2 — CRITIC (blind) re-verifies
- Every citation opens and contains the claim.
- Recency: all load-bearing sources are within 12 months, with older ones labeled.
- The strongest counter-position is presented and addressed.

**Verdict: PASS.**

## Output

The findings + a **claim table** (claim → source → supporting quote → confidence) + a "what we could not verify" section + the counter-evidence and how it was weighed + the date the research was performed.

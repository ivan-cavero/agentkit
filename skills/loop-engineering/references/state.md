# STATE.md — durable memory outside the model

The model context is disposable; the loop is not. STATE.md is the single
source of truth for a long-running loop.

## Minimum contents

1. **Goal** — the concrete outcome (the destination, never the implementation).
2. **Bar** — verbatim: what the artifact must match or beat, and how it is
   inspected (tests, benches, screenshots, eval).
3. **Budget** — rounds, parallel width, wall-clock/token ceiling.
4. **Status** — current round, per-unit PASS/FAIL with evidence.
5. **Round log** — what FAILed, what changed, what that produced.
6. **Open questions for the human** — anything the loop cannot decide.

## Conventions

- Read STATE.md at the start of every iteration.
- Update it after EVERY round, not at the end.
- Verdicts include evidence (test output, numbers), not claims.
- A human reads STATE.md asynchronously — never interrupt the loop to ask
  "how's it going?".

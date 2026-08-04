---
name: writing
description: >-
  Anti-slop writing skill for prose and documents (English + Spanish). Kills
  AI-sounding filler, throat-clearers, fake emphasis, and recap endings.
  Applies a stop-slop quality gate before delivery: directness, rhythm, trust,
  authenticity, density. Use for docs, READMEs, essays, posts, changelogs,
  release notes — anything where text must sound human. Trigger keywords:
  "anti-slop", "make this sound human", "write docs", "rewrite this",
  "stop-slop", "no AI writing", "documentation".
---

# Writing — prose that does not sound AI-generated

A quality gate for any text you produce or revise. Applies to English and
Spanish. The bar: the text reads like a competent human wrote it for a
specific reader — no filler, no cliches, no "AI-ese".

## Core rules

### 1. Kill the phrases

- Throat-clearers: "Here's the thing", "Here's what", "Here's why", "It turns
  out", "Let me be clear", "The truth is".
- Emphasis crutches: "Full stop", "Let that sink in", "Make no mistake",
  "This matters because".
- Filler: "really", "just", "literally", "simply", "actually", "truly",
  "fundamentally".
- Meta-commentary: "In this section we'll", "As we'll see", "Let me walk you
  through", "Hint:", "Plot twist:".
- Vague declarations: "The implications are significant", "The reasons are
  structural".
- Hollow sendoffs: "Happy coding!", "Hope this helps!", "Feel free to reach
  out".

### 2. Avoid the structures

- Binary contrasts: "Not because X. Because Y." -> state Y directly.
- Negative listings: "Not a X... Not a Y... A Z." -> state Z, skip the runway.
- Dramatic fragmentation: "[Noun]. That's it." -> complete sentences.
- Rhetorical setups: "What if..." / "Think about it:" -> make the point.
- Passive voice: "X was created" -> "The team created X".
- Narrator-from-distance: "This happens because" -> "You do X, then Y happens".

### 3. Vary rhythm

- Mix sentence lengths. Two items beat three.
- No em dashes (use commas or periods).
- Don't end every paragraph with a punchy one-liner.
- Don't stack short punchy sentences.

### 4. Be specific

- Name the specific thing. No "every", "always", "never" doing vague work.
- If something is important, show why — don't just call it important.
- Put the reader in the room. "You" beats "People". Specifics beat abstractions.

### 5. No AI conclusions

- No "In conclusion", "To summarize" — end when the content ends.
- No recap paragraphs that restate what you just said.
- No Section X / Section Y wrap-up move.
- The last sentence should carry information, not announce finality.

## Spanish slop to watch

- "En este artículo exploraremos" -> ve directo al punto.
- "Cabe destacar que" -> dilo sin anunciarlo.
- "Es importante mencionar" -> menciónalo, no lo anuncies.
- "A modo de ejemplo" -> pon el ejemplo directamente.
- "En otras palabras" -> escribe claro la primera vez.
- "Como veremos a continuación" -> no anuncies la estructura.
- "En conclusión", "En resumen" -> termina cuando termina.
- Adverbios: "simplemente", "básicamente", "fundamentalmente", "realmente".
- Voz pasiva: "fue desarrollado" -> "el equipo desarrolló".

## Quality gate — stop-slop score

Rate the prose 1-10 on each dimension before delivery. Below 35/50, revise.

| Dimension | Question |
|-----------|----------|
| Directness | Statements or announcements? |
| Rhythm | Varied or metronomic? |
| Trust | Respects reader intelligence? |
| Authenticity | Sounds human? |
| Density | Anything cuttable? |

Checklist:
1. Any adverbs? Kill them.
2. Any passive voice? Find the actor, make them the subject.
3. Inanimate thing doing a human verb? Name the person.
4. Sentence starts with a Wh- word? Restructure it.
5. Any "here's what/this/that" throat-clearing? Cut it.
6. Any "not X, it's Y" contrasts? State Y directly.
7. Does it end with a summary or recap? Delete it. End with information.
8. Three consecutive sentences match length? Break one.
9. Paragraph ends with punchy one-liner? Vary it.
10. Em-dash anywhere? Remove it.
11. Vague declarative? Name the specific thing.
12. Hollow sendoff? Delete it.

## Paired with gauntlet-loop

For iterative writing against a reference bar (blind A/B, delete-the-word test,
fact-check), use the `gauntlet-loop` skill's writing domain guide. This skill
is the gate; gauntlet-loop is the loop.

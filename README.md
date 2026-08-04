# AgentKit

**Universal installer for agents, skills, and commands** — works with OpenCode (v1/v2), oh-my-opencode (OMO), Oh My Pi (omp), Claude Code, Codex CLI, or **standalone** (skills only).

One command detects what you have, asks what you want, and writes files to the correct paths. Skills use the portable **Agent Skills** standard (`.agents/skills`, `~/.agents/skills`) so they load across tools.

---

## Install

### Requirements

- **Node.js** v18+ (the installer auto-installs its own TUI deps — no manual `npm install` needed for a one-liner install)
- Docker/Podman only if you enable the SearXNG MCP
- A coding harness only if you want full mode (standalone skills need none)

### Windows

```powershell
irm https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install.ps1 | iex
```

### Linux / macOS

```bash
curl -fsSL https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install.sh | bash
```

### From a local checkout

```bash
git clone https://github.com/ivan-cavero/agentkit.git
cd agentkit
node install-core.mjs
# optional: npm install   # only if you prefer pre-installing TUI deps
```

### Override source repo (testing forks)

```bash
# PowerShell
$env:AGENTKIT_REPO = "you/agentkit"; node install-core.mjs

# bash
AGENTKIT_REPO=you/agentkit node install-core.mjs
```

---

## How to use after install

Restart your harness (OpenCode, Claude Code, Codex, …). Then:

| What | How |
|------|-----|
| **Agents** | Primary agents appear as tabs; subagents via `@` autocomplete |
| **Commands** | Type `/gauntlet <your goal>` in any project |
| **Skills** | Auto-loaded when the task matches (Agent Skills standard) |

### Example: Gauntlet Loop

```
/gauntlet Implement the NBT reader for hyperion_protocol. Bar: round-trip with the
current writer for all tag types, critic-defined tests (not builder-defined), fuzz
target with no crashes, clippy -D warnings and clean fmt.
```

The lead agent splits the work, runs fresh `@gauntlet-builder` + `@gauntlet-critic` per piece, keeps a `workbench.md` progress log, and keeps going until the bar is beaten — or you stop it.

### Long unattended runs (OpenCode)

```bash
opencode serve --port 4096
opencode run --attach http://localhost:4096 --command gauntlet "your goal"
```

---

## What gets installed

### Skills (4)

| Skill | What it does | Origin |
|-------|--------------|--------|
| **gauntlet-loop** | Shumer method: split → build → blind critic → repeat against a real bar. Domain guides: coding, writing, design, research, data-analysis, prompt-eval, detection. | Adapted from Matt Shumer |
| **hallmark** | UI design skill that refuses AI-slop: themes, slop-test gates, verbs (`audit`, `redesign`, `study`, build). | [Nutlope/hallmark](https://github.com/Nutlope/hallmark), MIT |
| **loop-engineering** | Token budget + kill-switch, durable `STATE.md`, maker/checker verifier, worktree isolation, human gates. | Inspired by [cobusgreyling/loop-engineering](https://github.com/cobusgreyling/loop-engineering), MIT |
| **writing** | Anti-slop prose gate (EN + ES): kill filler, throat-clearers, fake emphasis, summary endings. | AgentKit |

### Agents (8)

**Core**

| Agent | Mode | Role |
|-------|------|------|
| **research** | primary | Discovery: live web + arxiv, compares options, recommended solution with evidence |
| **deep-research** | subagent | 5-loop exhaustive investigation with verifier challenges |
| **verifier** | subagent | Devil’s advocate: hunts counter-evidence for a claim |
| **code** | primary | General coding: read real code first, review, refactor, write |
| **docs-writer** | primary | Docs with anti-slop gates (EN/ES) |

**Gauntlet Loop**

| Agent | Role |
|-------|------|
| **gauntlet-builder** | Builds/fixes **one** piece. Never self-grades. |
| **gauntlet-critic** | Blind critic on the **real** artifact vs the bar. `edit: deny` |
| **gauntlet-smoother** | Integrates parallel builds into one coherent whole |

### Command

| Command | Role |
|---------|------|
| `/gauntlet` | Driver for a full Gauntlet Loop from your objective |

---

## Where files go (paths)

**Agents and commands are always user-global** (per harness you selected). Only **skills** can be project-scoped.

Skills follow the **Agent Skills open standard** so multiple harnesses can share them.

| Piece | Global install | Project skills |
|-------|----------------|----------------|
| **Skills (OpenCode / OMO)** | `~/.agents/skills/` | `.agents/skills/` in current repo |
| **Agents (OpenCode)** | `~/.config/opencode/agents/` | same (always global) |
| **Commands (OpenCode)** | `~/.config/opencode/commands/` | same (always global) |
| **Claude Code** | `~/.claude/{agents,skills,commands}/` | always global |
| **Codex CLI** | `~/.codex/skills/` | always global |
| **Oh My Pi** | `~/.omp/skills/` | always global |

OpenCode loads skills from both `~/.agents/skills` and `.agents/skills`. MCP/provider config is written to the user OpenCode config (`~/.config/opencode/`), not into the project.

---

## Supported harnesses

| Harness | Detection | Installs |
|---------|-----------|----------|
| **OpenCode** v1/v2 | `opencode` binary / Desktop | agents + skills + commands + MCPs + provider |
| **OpenCode 2 (next)** | `opencode2` | same as OpenCode |
| **oh-my-opencode (OMO)** | plugin / config | same paths as OpenCode |
| **Oh My Pi (omp)** | `omp` / `~/.omp` | skills |
| **Claude Code** | `claude` / `~/.claude` | agents + skills + commands |
| **Codex CLI** | `codex` / `~/.codex` | skills |
| **Standalone** | no harness | skills only → pick destination (default `~/.agents/skills`) |

**OpenCode v1 vs v2:** v2 uses plural folders (`agents/`, `commands/`); v1 uses singular (`agent/`, `command/`). The installer detects layout and lets you choose v1 / v2 / both.

---

## Install modes

| Mode | When | Result |
|------|------|--------|
| Full — OpenCode / OMO | harness detected | agents + skills + commands (+ optional MCP/provider) |
| Full — Oh My Pi / Claude / Codex | harness detected | what that tool supports |
| Full — global | default | agents/commands/skills into each selected harness’s user dirs |
| Full — project skills | OpenCode/OMO | skills → `.agents/skills` in repo; agents/commands still user-global |
| Standalone skills | no harness or skills-only | default `~/.agents/skills` (or project / custom) |

**Multi-harness:** pick every tool you use in one run — each gets files in **its** global folders. **One step per category:** harnesses → layout → skills scope → Gauntlet pack → agents → skills → commands → MCPs/provider/plugins.

---

## Concepts

### Agent

An AI “persona” with role, personality, and permissions. Markdown + frontmatter inside your harness.

- **Primary** (`mode: primary`) — main assistant (tabs in OpenCode). Ex: `research`, `code`.
- **Subagent** (`mode: subagent`) — specialist with clean context, invoked via `@`. Ex: `gauntlet-critic`, `verifier`.

### Skill

On-demand procedure pack (`SKILL.md` + `references/`). Loaded when the task needs it. Portable across tools via `.agents/skills`.

### Command

Slash command (`/name`) with `$ARGUMENTS`. Ex: `/gauntlet <goal>`.

---

## The Gauntlet Loop

A prompting method popularized by **Matt Shumer** (2026, *Claude of Duty*): ambitious goal + a **real bar** to beat. Split work into pieces; for each:

```
split → build → BLIND CRITIC → repeat
```

- **BUILDER** builds one piece and never self-grades.
- **CRITIC** (fresh context) inspects the **real** artifact (tests, metrics, screenshots) against the bar.
- On fail: return the biggest gap; **new critic every round**.
- No arbitrary round cap — stop when the bar wins or you stop the loop.

**Loop engineering** is the larger discipline (budget, durable state, verifiers, human gates). The Gauntlet Loop is the quality pattern inside it. AgentKit ships both: `gauntlet-loop` (what is good) and `loop-engineering` (how to run safely).

| Piece | Role |
|-------|------|
| `/gauntlet` | Loop driver |
| `gauntlet-builder` | Builds one piece |
| `gauntlet-critic` | Blind critic (`edit: deny`) |
| `gauntlet-smoother` | Integrates after parallel waves |
| `gauntlet-loop` skill | Full method + domain bar guides |

---

## Repo layout

```
agentkit/
├── install-core.mjs        # universal installer (Node)
├── install.sh / install.ps1# one-liner bootstraps
├── package.json            # TUI deps (@clack/prompts, kleur)
├── opencode.json           # MCP fragment (merged into your config)
├── agents/                 # 8 agents
├── commands/               # slash commands (gauntlet)
├── skills/                 # 4 skills + manifest.json
└── README.md
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|--------|-----|
| `ERR_MODULE_NOT_FOUND: kleur` or `@clack/prompts` | Temp one-liner missing deps | Fixed: writes a temp `package.json` and runs `npm install` (shell-safe on Windows/Node 24). Re-run the one-liner, or `node install-core.mjs` from a clone. |
| Terminal closes after `irm … \| iex` | Bootstrap called `exit` | Fixed: bootstrap never calls `exit` (that ends the whole PowerShell session). |
| `MCP merge failed: Unexpected non-whitespace…` | Bad remote fragment / comments | Installer uses JSONC-safe reads; ensure remote `opencode.json` is valid |
| Install finishes but `agents=0` | Remote repo missing files | Confirm `ivan-cavero/agentkit` (or `AGENTKIT_REPO`) has `agents/` on `main` |
| Test against a fork | — | `AGENTKIT_REPO=user/repo node install-core.mjs` |
| Skip MCP `npm pack` | — | `AGENTKIT_SKIP_NPM=1 node install-core.mjs` |

---

## License

MIT © Ivan Cavero. Third-party skills (hallmark, loop-engineering) keep their MIT licenses and attribution.

**Built with the method it installs: the Gauntlet Loop.**

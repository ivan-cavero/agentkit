# ⚡ AgentKit

**Instalador universal de agentes, skills y comandos para tus coding agents.**

Un solo comando instala lo que necesitas en **opencode (v1 y v2)**, **oh-my-opencode (OMO)**, **Oh My Pi (omp)**, **Claude Code**, **Codex CLI** — o en modo *standalone* (solo skills, sin ningún harness).

Cero configuración manual: detecta qué tienes instalado, te pregunta qué quieres (paso a paso), y escribe los archivos en las rutas correctas de cada herramienta.

---

## Tabla de contenidos

1. [Conceptos: agent, skill, command](#conceptos)
2. [El Gauntlet Loop](#gauntlet)
3. [Las 4 skills incluidas](#skills)
4. [Los 8 agentes incluidos](#agentes)
5. [Harnesses soportados](#harnesses)
6. [Modos de instalación](#modos)
7. [Instalación](#instalacion)
8. [Cómo se usa después](#uso)
9. [Estructura del repo](#estructura)
10. [Solución de problemas](#troubleshooting)

---

<a id="conceptos"></a>
## 1. Conceptos: agent, skill, command

### Agent
Un **agente** es una "persona" de IA con un rol, una personalidad y permisos definidos, que vive dentro de tu coding agent (opencode, Claude Code…). Se define en un archivo Markdown con *frontmatter* (descripción, modo, permisos) y un prompt que le dice qué es y cómo comportarse.

Dos tipos:
- **Agente primario** (`mode: primary`) — el asistente principal con el que interactúas. Aparece como pestaña (tab) en opencode. Ej: `research`, `code`.
- **Subagente** (`mode: subagent`) — un especialista que el agente principal invoca para tareas concretas con **contexto limpio** (no ve la conversación del padre). Aparece en `@` autocomplete. Ej: `gauntlet-critic`, `verifier`.

Instalar un agente = poner su `.md` en la carpeta de agentes de tu harness (`~/.config/opencode/agents/`, `~/.claude/agents/`, …).

### Skill
Una **skill** es un paquete de instrucciones reutilizables (formato `SKILL.md` + `references/`) que el agente carga **bajo demanda** cuando la tarea lo requiere. Es como un "manual de procedimientos" que se activa automáticamente. Ej: la skill `gauntlet-loop` se carga cuando pides iterar contra un bar de calidad.

### Command
Un **command** (slash command) es un prompt empaquetado que ejecutas con `/nombre`. Recibe argumentos (`$ARGUMENTS`) y lanza una acción. Ej: `/gauntlet <objetivo>` arranca un Gauntlet Loop completo.

---

<a id="gauntlet"></a>
## 2. El Gauntlet Loop

El **Gauntlet Loop** es un método de prompting para agentes, popularizado por **Matt Shumer** en 2026 con su proyecto viral *Claude of Duty* (un FPS estilo Call of Duty construido por un solo prompt, ~55.000 líneas de código, sin assets externos).

### La idea

Dale a un agente un objetivo ambicioso y un **bar real** que superar (tests, benchmarks, screenshots de un producto de referencia…). Deja que **divida** el trabajo en piezas pequeñas. Para cada pieza:

```
split → build → BLIND CRITIC → repeat
```

- **BUILDER** construye la pieza. *Nunca se autoevalúa* — un agente que construyó algo es un juez sesgado.
- **CRITIC** (crítico ciego, con contexto fresco) inspecciona el **artefacto REAL** (compila, corre tests, mide, hace screenshot) contra el bar. No ve el razonamiento del builder.
- Si pierde, identifica **el mayor gap** y lo devuelve a otra ronda. **Crítico nuevo en cada ronda** (reutilizar uno contamina el veredicto).
- Se repite **sin límite arbitrario** hasta que el artefacto gane al bar — o tú lo pares.

> El bar no necesita ser alcanzable. Call of Duty nunca perdió contra el juego de Shumer; solo dio dirección y evitó que parara en "bastante bueno para IA".

### Loop engineering = Gauntlet?

No exactamente. **Loop engineering** es la disciplina completa (el contenedor): diseñar sistemas donde agentes trabajan en ciclos persistentes con presupuesto, estado durable, verificadores y gates humanos. El **Gauntlet Loop** es un patrón de calidad DENTRO de ella (builder + crítico ciego + bar). Por eso AgentKit incluye ambas: `gauntlet-loop` decide **qué es bueno**; `loop-engineering` decide **cómo correr el loop de forma segura y repetible**.

### Qué instala el pack Gauntlet

| Pieza | Rol |
|-------|-----|
| `/gauntlet` command | El driver: lanza el loop desde tu objetivo |
| `gauntlet-builder` (subagente) | Construye/arregla una pieza concreta |
| `gauntlet-critic` (subagente) | Crítico ciego: inspecciona el artefacto REAL, `edit: deny` |
| `gauntlet-smoother` (subagente) | Integra las piezas tras cada ola (armoniza, no rediseña) |
| `gauntlet-loop` skill | El método completo + guías por dominio (coding, writing, design…) |

---

<a id="skills"></a>
## 3. Las 4 skills incluidas

| Skill | Qué hace | Origen |
|-------|----------|--------|
| **gauntlet-loop** | Método completo de Shumer: split → build → blind critic → repeat contra un bar real. Guías por dominio: coding (test-as-bar), writing (blind A/B vs texto modelo), design, research, data-analysis, prompt-eval, detection. | Adaptación atribuida de Matt Shumer |
| **hallmark** | Skill de diseño UI que **se niega a parecer generada por IA**: 20 temas, 57 slop-test gates, y 4 verbos (`audit`, `redesign`, `study`, build). | [Nutlope/hallmark](https://github.com/Nutlope/hallmark), MIT |
| **loop-engineering** | El contenedor del Gauntlet: presupuesto de tokens con kill-switch, `STATE.md` como memoria durable, maker/checker verifier (REJECT hasta que la evidencia sea fuerte), worktree isolation, anti-gaming, human gates que superan al loop. | Inspirada en [cobusgreyling/loop-engineering](https://github.com/cobusgreyling/loop-engineering), MIT |
| **writing** | Gate anti-slop para prosa y documentos (EN + ES): mata relleno, throat-clearers, énfasis falso, finales-resumen. Checklist de 12 puntos + lista de slop en español ("En este artículo exploraremos", "Cabe destacar"...). | AgentKit (de los gates de tu docs-writer + dominio writing de gauntlet-loop) |

---

<a id="agentes"></a>
## 4. Los 8 agentes incluidos

### Núcleo (research)
| Agente | Modo | Qué hace |
|--------|------|----------|
| **research** | primary | Agente de descubrimiento: investiga tu problema real con búsqueda web + arxiv en vivo, compara opciones y da una solución recomendada con evidencia. La primera conclusión es un borrador — intenta refutarse a sí mismo. |
| **deep-research** | subagent | Investigación exhaustiva de 5 loops: genera hipótesis, busca en paralelo, reta al líder con un verifier, y solo termina con confianza alta. |
| **verifier** | subagent | Abogado del diablo independiente: dado un claim, busca activamente contra-evidencia y devuelve un informe de reto estructurado. |
| **code** | primary | Agente de código general: lee el código real primero, revisa patrones contra mejores prácticas actuales, refactoriza y escribe. |
| **docs-writer** | primary | Documentación con gates anti-slop: lee código, verifica contra fuentes oficiales, escribe docs que suenan humanas (EN/ES). |

### Gauntlet Loop (subagentes)
| Agente | Qué hace |
|--------|----------|
| **gauntlet-builder** | BUILDER: construye o arregla UNA pieza específica. Nunca se autoevalúa — el crítico decide. |
| **gauntlet-critic** | CRITIC: crítico ciego y despiadado. Inspecciona el artefacto REAL (corre tests, mide, screenshot) contra el bar, devuelve PASS/FAIL + el mayor gap. `edit: deny` — solo juzga. |
| **gauntlet-smoother** | SMOOTHER: tras una ola de builds paralelos, integra las piezas, arregla inconsistencias y hace que el todo se sienta coherente. |

---

<a id="harnesses"></a>
## 5. Harnesses soportados

| Harness | Detección | Qué instala | Dónde |
|---------|-----------|-------------|-------|
| **opencode** (v1/v2) | binario `opencode` / Desktop | agents + skills + commands + MCPs + provider | `~/.config/opencode/` (v2 plural) o `agent/` (v1 legacy) |
| **opencode 2 (next)** | binario `opencode2` | igual que opencode | igual que opencode |
| **oh-my-opencode (OMO)** | config `oh-my-openagent*` / plugin | igual que opencode | **mismas rutas** que opencode (las comparte) |
| **Oh My Pi (omp)** | binario `omp` / `~/.omp` | skills | `~/.omp/skills/` (también hereda `.claude`/`.codex` skills) |
| **Claude Code** | binario `claude` / `~/.claude` | agents + skills + commands | `~/.claude/` (formato Anthropic) |
| **Codex CLI** | binario `codex` / `~/.codex` | skills | `~/.codex/skills/` |

> **opencode v1 vs v2**: v2 (actual) usa carpetas plurales (`agents/`, `skills/`, `commands/`); v1 (legacy) usa singulares (`agent/`, `command/`). AgentKit detecta tu layout y te deja elegir v1 / v2 / **both**.

---

<a id="modos"></a>
## 6. Modos de instalación

| Modo | Cuándo | Qué consigues |
|------|--------|---------------|
| **Full — opencode/OMO** | opencode detectado | agents + skills + commands + MCPs + provider, en `~/.config/opencode/` |
| **Full — Oh My Pi (omp)** | `omp` detectado | skills en `~/.omp/skills/` |
| **Full — Claude Code** | `claude` detectado | agents + skills + commands en `~/.claude/` |
| **Full — Codex** | `codex` detectado | skills en `~/.codex/skills/` |
| **Full — project** | dentro de un repo | archivos opencode/OMO en `.opencode/` del proyecto actual |
| **Standalone skills** | sin harness, o solo quieres skills | skills en `~/.agents/skills`, `~/.claude/skills`, `~/.config/opencode/skills`, `.opencode/skills`, o ruta custom |

**Multi-harness**: detecta todo lo que tienes y te pregunta para cuáles instalar — la misma selección puede ir a opencode, OMO, omp, Claude Code y Codex en un solo run.

**Un paso por cosa**: cada categoría es una pregunta separada (harnesses → layout → scope → pack Gauntlet → agents → skills → commands → MCPs/provider/plugins). Cada lista muestra el catálogo COMPLETO y eliges con `space` (nada preseleccionado salvo los items del pack Gauntlet confirmado).

---

<a id="instalacion"></a>
## 7. Instalación

### Linux / macOS
```bash
curl -fsSL https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install.sh | bash
```

### Windows
```powershell
irm https://raw.githubusercontent.com/ivan-cavero/agentkit/main/install.ps1 | iex
```

### Directo (sin instalar nada a mano)
El instalador **auto-instala sus dependencias** (`@clack/prompts`, `kleur`) la primera vez. Solo necesitas Node.js (v18+):

```bash
node install-core.mjs          # desde un checkout
```

### Requisitos
- **Node.js** (v18+) — no hace falta `npm install` manual
- **Docker/Podman** (solo si activas el MCP SearXNG)
- **opencode / OMO / omp / Claude / Codex** (solo para modo full; standalone no necesita ninguno)

---

<a id="uso"></a>
## 8. Cómo se usa después

Reinicia tu harness. Entonces:

- **Agentes** aparecen como pestañas (primarios) o en `@` autocomplete (subagentes).
- **Comandos**: escribe `/gauntlet <tu objetivo>` en cualquier proyecto.
- **Skills**: se cargan automáticamente cuando la tarea es relevante.

### Ejemplo de Gauntlet Loop

```
/gauntlet Implementa el NBT reader de hyperion_protocol. Bar: round-trip con el
writer actual para todos los tag types, tests definidos por el crítico (no el
builder), fuzz target sin crashes, clippy -D warnings y fmt limpios.
```

El agente lead divide el trabajo, lanza `@gauntlet-builder` + `@gauntlet-critic` frescos por pieza, mantiene un `workbench.md` de progreso, y no para hasta superar el bar — o hasta que tú lo pares.

### Runs largos sin supervisión
```bash
opencode serve --port 4096
opencode run --attach http://localhost:4096 --command gauntlet "tu objetivo"
```

---

<a id="estructura"></a>
## 9. Estructura del repo

```
agentkit/
├── install-core.mjs        # instalador universal (Node, zero-config)
├── install.sh / install.ps1# bootstraps (descarga + ejecuta)
├── package.json            # deps del TUI (@clack/prompts, kleur)
├── opencode.json           # fragmento MCP (se fusiona en tu config)
├── agents/                 # 8 agentes (.md con frontmatter)
├── commands/               # slash commands (gauntlet)
├── skills/                 # 4 skills + manifest.json
│   ├── manifest.json       # catálogo data-driven que consume el instalador
│   ├── gauntlet-loop/      # skill del método Shumer
│   ├── hallmark/           # skill de diseño anti-slop (MIT, Nutlope)
│   ├── loop-engineering/   # skill del contenedor (budget/state/verifier)
│   └── writing/            # skill anti-slop de prosa EN+ES
└── README.md
```

---

<a id="troubleshooting"></a>
## 10. Solución de problemas

| Problema | Causa | Fix |
|----------|-------|-----|
| `ERR_MODULE_NOT_FOUND: @clack/prompts` | faltan deps | el instalador las auto-instala; si falló, `npm install` en la carpeta |
| `MCP merge failed: Unexpected non-whitespace character after JSON` | `getText` recibía `404: Not Found` | arreglado: ahora 4xx/5xx devuelve `null`; además `readJSON` es JSONC-safe (BOM + comentarios) |
| "Instala pero agents=0" | el repo remoto aún no tiene los archivos | renombra/push a `ivan-cavero/agentkit` y vuelve a ejecutar |
| Quiero probar contra otro repo | — | `AGENTKIT_REPO=usuario/repo node install-core.mjs` |
| Quiero saltar `npm pack` de MCPs | — | `AGENTKIT_SKIP_NPM=1 node install-core.mjs` |

---

## Licencia

MIT © Ivan Cavero. Proyecto independiente — las skills de terceros (hallmark, loop-engineering) conservan sus licencias (MIT) y su atribución.

**Hecho con el método que instala: el Gauntlet Loop.**
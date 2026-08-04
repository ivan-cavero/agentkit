import fs from 'fs';
import path from 'path';
import https from 'https';
import { spawnSync } from 'child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// ─── AgentKit — universal installer ───────────────────────
// Uses @clack/prompts + kleur for the TUI. Auto-installs deps if missing.
// IMPORTANT: both must be dynamic imports — static `import kleur` is hoisted
// and runs BEFORE this ensure step (breaks curl|bash / irm|iex temp installs).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TUI_DEPS = { '@clack/prompts': '^0.9.0', kleur: '^4.1.5' };

function hasModule(name) {
    try { require.resolve(name); return true; } catch { return false; }
}

function ensureTuiDeps() {
    if (hasModule('@clack/prompts') && hasModule('kleur')) return;
    console.log('\n  AgentKit: installing TUI dependencies (@clack/prompts, kleur)...');

    // Bootstrap may drop only this .mjs into a temp dir (no package.json).
    // Write a minimal one so `npm install` is reliable across platforms.
    // Note: on Node 24 + Windows, spawnSync('npm.cmd', args) without shell
    // returns EINVAL — always use shell:true with a single command string.
    const pkgPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        fs.writeFileSync(pkgPath, JSON.stringify({
            name: 'agentkit-installer-runtime',
            private: true,
            type: 'module',
            dependencies: TUI_DEPS,
        }, null, 2));
    }

    const r = spawnSync('npm install --no-audit --no-fund --loglevel=error', {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
        env: process.env,
    });

    if ((r.status !== 0 && r.status !== null) || r.error || !hasModule('@clack/prompts') || !hasModule('kleur')) {
        console.error('\n  Failed to install dependencies.');
        if (r.error) console.error('  spawn error:', r.error.message);
        console.error('  Run manually:');
        console.error('    cd "' + __dirname + '"');
        console.error('    npm install\n');
        process.exit(1);
    }
}

ensureTuiDeps();

const { select, multiselect, confirm, text, password, intro, outro, note, isCancel, spinner } = await import('@clack/prompts');
const kleur = (await import('kleur')).default;
const { bold, green, yellow, cyan, gray, red, magenta, blue, dim, underline } = kleur;
// Modern palette: brighter, friendlier on dark terminals.
const P = {
    // Original palette: warm amber -> coral -> violet, readable on dark backgrounds.
    brand: (s) => bold(magenta(s)),
    brand2: (s) => bold(yellow(s)),
    step: (s) => bold(cyan(s)),
    ok: (s) => bold(green(s)),
    warn: (s) => bold(yellow(s)),
    err: (s) => bold(red(s)),
    hint: (s) => gray(s),
    hi: (s) => bold(blue(s)),
    accent: (s) => cyan(s),
    // extra
    amber: (s) => bold(yellow(s)),
    coral: (s) => bold(red(s)),
    violet: (s) => bold(magenta(s)),
    teal: (s) => bold(cyan(s)),
    mint: (s) => bold(green(s)),
    soft: (s) => gray(s),
};
const BANNER = [
    '',
    '  ' + bold(cyan('  █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗  ██╗██╗████████╗')),
    '  ' + bold(cyan('  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║ ██╔╝██║╚══██╔══╝')),
    '  ' + bold(green('  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   █████╔╝ ██║   ██║   ')),
    '  ' + bold(green('  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██╔═██╗ ██║   ██║   ')),
    '  ' + bold(magenta('  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║  ██╗██║   ██║   ')),
    '  ' + bold(magenta('  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝   ╚═╝   ')),
    '',
    '  ' + bold('✦ universal installer for coding agents ✦') + gray('   opencode v1/v2 · OMO · Oh My Pi · Claude Code · Codex · standalone'),
    ''
].join('\n');

const REPO = process.env.AGENTKIT_REPO || 'ivan-cavero/agentkit';
const RAW = `https://raw.githubusercontent.com/${REPO}/main`;
const HOME = process.env.HOME || process.env.USERPROFILE || '~';
// Standard user config. OpenCode 2 may override via OPENCODE_CONFIG_DIR
// (Orca sets this to AppData\Roaming\orca\opencode-hooks\shared).
const STANDARD_CONFIG_DIR = path.join(HOME, '.config', 'opencode');
const ENV_CONFIG_DIR = process.env.OPENCODE_CONFIG_DIR || process.env.ORCA_OPENCODE_CONFIG_DIR || '';
const CONFIG_DIR = ENV_CONFIG_DIR ? path.resolve(ENV_CONFIG_DIR) : STANDARD_CONFIG_DIR;
/** All dirs where opencode config/agents/commands should be written. */
function openCodeConfigDirs() {
    const dirs = [STANDARD_CONFIG_DIR];
    if (ENV_CONFIG_DIR) {
        const resolved = path.resolve(ENV_CONFIG_DIR);
        if (!dirs.some((d) => path.resolve(d) === resolved)) dirs.push(resolved);
    }
    return dirs;
}

// ─── Catalogs ─────────────────────────────────────────────
const AGENT_CATALOG = [
    { file: 'research.md', label: 'research', hint: 'web search & comparisons', group: 'core',
      desc: 'Discovery agent: investigates your real problem with live web + arxiv search, compares options and gives a recommended solution with evidence. The first conclusion is a draft — it tries to prove itself wrong.' },
    { file: 'deep-research.md', label: 'deep-research', hint: 'exhaustive multi-round', group: 'core',
      desc: '5-loop exhaustive investigation for complex topics: generates hypotheses, searches multiple sources in parallel, challenges the leader with a verifier, and only finishes when confidence is high.' },
    { file: 'verifier.md', label: 'verifier', hint: "devil's advocate", group: 'core',
      desc: 'Independent devil\'s advocate subagent: given a claim or conclusion, it actively searches for counter-evidence and returns a structured challenge report.' },
    { file: 'code.md', label: 'code', hint: 'review · refactor · write code', group: 'core',
      desc: 'General coding agent: reads the actual code first, reviews patterns against current best practices, refactors and writes code. Local-first: the code is the source of truth, web search verifies.' },
    { file: 'docs-writer.md', label: 'docs-writer', hint: 'documentation (anti-slop)', group: 'core',
      desc: 'Documentation writer with stop-slop quality gates: reads code, verifies against official sources, and writes human-sounding docs in English or Spanish.' },
    { file: 'gauntlet-builder.md', label: 'gauntlet-builder', hint: 'Gauntlet Loop: specialist builder', group: 'gauntlet',
      desc: 'BUILDER role of the Gauntlet Loop: builds or fixes one specific piece of an artifact. Never grades its own work — the critic decides. Focused on producing a REAL artifact (code that compiles, tests passing).' },
    { file: 'gauntlet-critic.md', label: 'gauntlet-critic', hint: 'Gauntlet Loop: blind critic', group: 'gauntlet',
      desc: 'CRITIC role of the Gauntlet Loop: ruthless blind critic that inspects the REAL artifact (runs tests, measures, screenshots) against the bar and returns PASS/FAIL + the single biggest gap. edit: deny — it only judges.' },
    { file: 'gauntlet-smoother.md', label: 'gauntlet-smoother', hint: 'Gauntlet Loop: smoothing pass', group: 'gauntlet',
      desc: 'SMOOTHER role of the Gauntlet Loop: after a wave of parallel builds, integrates the pieces, fixes inconsistencies and makes the whole feel like one coherent thing. Harmonizes, does not redesign.' },
];

const COMMAND_CATALOG = [
    { file: 'gauntlet.md', label: 'gauntlet', hint: 'run a Gauntlet Loop', group: 'gauntlet' },
];

const GAUNTLET_PACK = {
    agents: ['gauntlet-builder.md', 'gauntlet-critic.md', 'gauntlet-smoother.md'],
    skills: ['gauntlet-loop'],
    commands: ['gauntlet.md'],
};

const FALLBACK_SKILL_FILES = {
    'gauntlet-loop': [
        'SKILL.md',
        'references/choosing-the-bar.md',
        'references/critic-design.md',
        'references/methodology.md',
        'references/prompt-templates.md',
        'references/running-the-loop.md',
        'references/domains/coding.md',
        'references/domains/data-analysis.md',
        'references/domains/design.md',
        'references/domains/detection.md',
        'references/domains/prompt-eval.md',
        'references/domains/research.md',
        'references/domains/writing.md',
    ],
    'hallmark': [], // fetched live from skills/manifest.json (106 files)
    'loop-engineering': ['SKILL.md', 'references/budget.md', 'references/state.md'],
    'writing': ['SKILL.md'],
};

// Harnesses. omp = Oh My Pi (omp.sh) — a DIFFERENT tool from oh-my-opencode.
// opencode v2 = plural dirs; v1 = singular. OMO shares opencode paths.
const HARNESSES = [
    { id: 'opencode', label: 'opencode', hint: 'CLI / Desktop / Zen — v1 & v2' },
    { id: 'opencode2', label: 'opencode 2 (next)', hint: 'opencode2 binary — v0.0.0-next' },
    { id: 'omo', label: 'oh-my-opencode (OMO)', hint: 'opencode plugin — same paths' },
    { id: 'omp', label: 'Oh My Pi (omp)', hint: 'omp.sh — ~/.omp + inherits .claude/.codex skills' },
    { id: 'claude', label: 'Claude Code', hint: '~/.claude/ — Anthropic format' },
    { id: 'codex', label: 'Codex CLI', hint: '~/.codex/ — skills only' },
];

// ─── Network helpers ──────────────────────────────────────
function getJSON(url, headers = {}, { timeout = 15000, redirects = 5 } = {}) {
    return new Promise((resolve) => {
        const req = https.get(url, { headers, timeout }, (res) => {
            // Follow redirects (some OpenAI-compatible APIs bounce)
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
                res.resume();
                const next = new URL(res.headers.location, url).href;
                return resolve(getJSON(next, headers, { timeout, redirects: redirects - 1 }));
            }
            let d = '';
            res.on('data', (ch) => d += ch);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 400) return resolve(null);
                try { resolve(JSON.parse(d)); } catch { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

function getText(url) {
    return new Promise((resolve) => {
        https.get(url, { timeout: 5000 }, (res) => {
            if (res.statusCode && res.statusCode >= 400) {
                res.resume();
                return resolve(null);
            }
            let d = '';
            res.on('data', (ch) => d += ch);
            res.on('end', () => resolve(d));
        }).on('error', () => resolve(null));
    });
}

function download(url, dest) {
    return new Promise((resolve) => {
        try {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            // Refuse to open a path that is already a directory (EISDIR)
            if (fs.existsSync(dest) && fs.statSync(dest).isDirectory()) {
                return resolve(false);
            }
            const file = fs.createWriteStream(dest);
            file.on('error', () => { try { fs.unlinkSync(dest); } catch {} resolve(false); });
            https.get(url, { timeout: 15000 }, (res) => {
                if (res.statusCode && res.statusCode >= 400) {
                    res.resume();
                    file.close();
                    try { fs.unlinkSync(dest); } catch {}
                    return resolve(false);
                }
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            }).on('error', () => { file.close(); try { fs.unlinkSync(dest); } catch {} resolve(false); });
        } catch {
            resolve(false);
        }
    });
}

/** Normalize skill file lists from manifest (array, single string, or missing). */
function normalizeSkillFiles(files, skillName) {
    let list = files;
    if (typeof list === 'string' && list.trim()) list = [list.trim()];
    if (!Array.isArray(list) || list.length === 0) {
        list = FALLBACK_SKILL_FILES[skillName] || ['SKILL.md'];
    }
    // Drop empties / "." / ".." — iterating a string char-by-char used to make
    // path.join(dest, '.') === dest (directory) → EISDIR on createWriteStream.
    return list
        .map((f) => String(f || '').replace(/\\/g, '/').trim())
        .filter((f) => f && f !== '.' && f !== '..' && !f.includes('\0'));
}

async function downloadSkill(name, destRoot, files) {
    fs.mkdirSync(destRoot, { recursive: true });
    const list = normalizeSkillFiles(files, name);
    let ok = 0;
    for (const rel of list) {
        const dest = path.join(destRoot, rel);
        // Never write into the skill root as if it were a file
        if (path.resolve(dest) === path.resolve(destRoot)) continue;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        if (await download(`${RAW}/skills/${name}/${rel}`, dest)) ok++;
    }
    return ok;
}

function run(cmd, { inherit = false } = {}) {
    // inherit=true for interactive tools (TimeFly login, etc.) so the user can
    // actually see prompts. Default pipe keeps setup noise out of the TUI.
    const sh = process.platform === 'win32';
    return spawnSync(sh ? 'cmd' : 'bash', [sh ? '/c' : '-c', cmd], {
        stdio: inherit ? 'inherit' : 'pipe',
        env: process.env,
    });
}

// Known NaN chat models — always offered even if /models is slow or partial.
const KNOWN_NAN_MODELS = [
    { id: 'deepseek-v4-flash', hint: '284B MoE · 1M ctx · reasoning' },
    { id: 'mimo-v2.5', hint: '310B MoE · omnimodal (text+vision+audio)' },
    { id: 'gemma4', hint: '26B MoE · multimodal · vision' },
    { id: 'qwen3.6', hint: '35B MoE · 256K ctx · multimodal' },
];

function mergeModelOptions(apiModels, known = []) {
    const byId = new Map();
    for (const k of known) byId.set(k.id, { label: k.id, value: k.id, hint: k.hint || modelHint(k.id) });
    for (const m of apiModels || []) {
        const id = typeof m === 'string' ? m : m?.id;
        if (!id) continue;
        if (id.includes('embedding') || id.includes('rerank') || id.includes('kokoro') || id.includes('whisper')) continue;
        const prev = byId.get(id);
        byId.set(id, { label: id, value: id, hint: prev?.hint || modelHint(id) });
    }
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}

// ─── Harness detection ────────────────────────────────────
function hasCmd(name) {
    try { return spawnSync(name, ['--version'], { stdio: 'pipe' }).status === 0; } catch { return false; }
}

function detectOpenCodeVersion() {
    if (fs.existsSync(path.join(CONFIG_DIR, 'agents'))) return 'v2';
    if (fs.existsSync(path.join(CONFIG_DIR, 'agent'))) return 'v1';
    return 'v2';
}

function detectHarnesses() {
    const found = [];
    const oc = hasCmd('opencode');
    let hasDesktop = false;
    if (fs.existsSync('/opt/OpenCode/ai.opencode.desktop')) hasDesktop = true;
    if (fs.existsSync('/Applications/OpenCode.app')) hasDesktop = true;
    if (process.platform === 'win32') {
        const ld = process.env.LOCALAPPDATA || '';
        if (fs.existsSync(path.join(ld, 'Programs', 'opencode-desktop'))) hasDesktop = true;
        if (fs.existsSync(path.join(process.env.ProgramFiles || 'C:\\Program Files', 'OpenCode'))) hasDesktop = true;
    }
    if (oc || hasDesktop) found.push('opencode');
    if (hasCmd('opencode2')) found.push('opencode2');

    // oh-my-opencode / oh-my-openagent (opencode plugin)
    const omoNames = ['oh-my-openagent.jsonc', 'oh-my-openagent.json', 'oh-my-opencode.jsonc', 'oh-my-opencode.json'];
    let hasOMO = false;
    for (const n of omoNames) {
        if (fs.existsSync(path.join(CONFIG_DIR, n))) hasOMO = true;
        if (fs.existsSync(path.join(process.cwd(), '.opencode', n))) hasOMO = true;
    }
    if (!hasOMO) {
        try {
            for (const cfgFile of ['opencode.jsonc', 'opencode.json']) {
                const p = path.join(CONFIG_DIR, cfgFile);
                if (!fs.existsSync(p)) continue;
                const cfg = readJSON(p);
                const plugins = (cfg.plugin || []).map((x) => (typeof x === 'string' ? x : Array.isArray(x) ? x[0] : ''));
                if (plugins.some((x) => x.includes('oh-my-openagent') || x.includes('oh-my-opencode'))) hasOMO = true;
            }
        } catch {}
    }
    if (hasOMO) found.push('omo');

    // Oh My Pi (omp) — omp.sh, distinct tool: binary `omp` + ~/.omp config dir
    if (hasCmd('omp') || fs.existsSync(path.join(HOME, '.omp')) || fs.existsSync(path.join(HOME, '.config', 'omp'))) {
        found.push('omp');
    }

    if (hasCmd('claude') || fs.existsSync(path.join(HOME, '.claude'))) found.push('claude');
    if (hasCmd('codex') || fs.existsSync(path.join(HOME, '.codex'))) found.push('codex');

    return { found, ocVersion: detectOpenCodeVersion() };
}

// ─── JSONC-safe read (BOM + comments) ─────────────────────
// opencode configs may be JSONC (comments allowed). Strip them before parse.
function stripJsonc(src) {
    let s = src.replace(/^﻿/, '');
    let out = '';
    let i = 0;
    let inStr = false;
    while (i < s.length) {
        const ch = s[i];
        const nx = s[i + 1];
        if (inStr) {
            out += ch;
            if (ch === String.fromCharCode(92) && i + 1 < s.length) { out += s[i + 1]; i += 2; continue; }
            if (ch === String.fromCharCode(34)) inStr = false;
            i += 1;
            continue;
        }
        if (ch === String.fromCharCode(34)) { inStr = true; out += ch; i += 1; continue; }
        if (ch === String.fromCharCode(47) && nx === String.fromCharCode(47)) {
            while (i < s.length && s[i] !== String.fromCharCode(10)) i += 1;
            continue;
        }
        if (ch === String.fromCharCode(47) && nx === String.fromCharCode(42)) {
            i += 2;
            while (i < s.length && !(s[i] === String.fromCharCode(42) && s[i + 1] === String.fromCharCode(47))) i += 1;
            i += 2;
            continue;
        }
        out += ch;
        i += 1;
    }
    return out;
}
function readJSON(file) {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(stripJsonc(raw).trim());
}
// ─── Provider writer ──────────────────────────────────────
function resolveConfigFile(scope, baseDir = CONFIG_DIR) {
    if (scope === 'project') {
        // Prefer project-root opencode.json (OpenCode 2 discovers it); fall back to .opencode/
        const root = path.join(process.cwd(), 'opencode.json');
        const nested = path.join(process.cwd(), '.opencode', 'opencode.json');
        if (fs.existsSync(root)) return root;
        if (fs.existsSync(nested)) return nested;
        fs.mkdirSync(path.dirname(nested), { recursive: true });
        fs.writeFileSync(nested, JSON.stringify({ $schema: 'https://opencode.ai/config.json' }, null, 2));
        return nested;
    }
    if (fs.existsSync(path.join(baseDir, 'opencode.jsonc'))) return path.join(baseDir, 'opencode.jsonc');
    if (fs.existsSync(path.join(baseDir, 'opencode.json'))) return path.join(baseDir, 'opencode.json');
    const p = path.join(baseDir, 'opencode.json');
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify({ $schema: 'https://opencode.ai/config.json' }, null, 2));
    return p;
}

/** Global config paths for every OpenCode config root (standard + OPENCODE_CONFIG_DIR). */
function resolveAllGlobalConfigFiles() {
    return openCodeConfigDirs().map((dir) => resolveConfigFile('global', dir));
}

/** Convert v1-style model meta → OpenCode v2 model entry (capabilities, etc.). */
function toV2ModelEntry(meta = {}) {
    const entry = {};
    if (meta.name) entry.name = meta.name;
    // OpenCode 2 requires non-empty modality arrays when capabilities are set
    // (migration does modalities?.input ?? [] which can hide chat models).
    entry.capabilities = {
        tools: meta.tool_call !== false,
        input: (meta.modalities?.input?.length ? meta.modalities.input : ['text']),
        output: (meta.modalities?.output?.length ? meta.modalities.output : ['text']),
    };
    if (meta.limit) entry.limit = meta.limit;
    return entry;
}

/**
 * Write a custom OpenAI-compatible provider for BOTH OpenCode classic and v2.
 *
 * Critical OpenCode 2 behavior (next/beta):
 *   If the config still has v1 keys (`provider`, `plugin`, or v1-shaped `mcp`),
 *   OpenCode 2 runs ConfigMigrateV1 and ONLY migrates `provider` (singular).
 *   A pure `providers` (plural) block is treated as an excess property and DROPPED.
 *   So we MUST keep writing the classic `provider` + npm + options shape.
 *
 * We also write `providers` (plural) with package `aisdk:@ai-sdk/openai-compatible`
 * for pure-v2 configs (no v1 keys) — matching what migration emits.
 *
 * @see https://opencode.ai/docs/providers/
 * @see https://opencode.ai/v2/docs/providers
 */
function applyProviderToConfig(cfg, id, name, url, key, modelsV1, modelsV2, defaultModel) {
    if (!cfg.provider) cfg.provider = {};
    cfg.provider[id] = {
        npm: '@ai-sdk/openai-compatible',
        name,
        options: { baseURL: url, ...(key ? { apiKey: key } : {}) },
        models: modelsV1,
    };

    // Pure v2 shape (when config is not detected as v1). package form MUST be
    // aisdk:… — matches ConfigMigrateV1.migrateProvider and ModelResolver routes.
    if (!cfg.providers) cfg.providers = {};
    const envName = `${String(id).replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()}_API_KEY`;
    cfg.providers[id] = {
        name,
        ...(key ? { env: [envName] } : {}),
        package: 'aisdk:@ai-sdk/openai-compatible',
        settings: {
            baseURL: url,
            ...(key ? { apiKey: key } : {}),
        },
        models: modelsV2,
    };

    cfg.model = `${id}/${defaultModel}`;
    return cfg;
}

function writeProvider(configFile, id, name, url, key, models, defaultModel) {
    const modelsV1 = { ...(models || {}) };
    // Explicit text modalities so v2 capabilities migrate cleanly
    for (const mid of Object.keys(modelsV1)) {
        const m = modelsV1[mid] = { ...modelsV1[mid] };
        if (!m.modalities) m.modalities = { input: ['text'], output: ['text'] };
        if (m.tool_call === undefined) m.tool_call = true;
    }
    const modelsV2 = {};
    for (const [mid, meta] of Object.entries(modelsV1)) {
        modelsV2[mid] = toV2ModelEntry(meta);
    }

    // Write to the primary config file AND every OpenCode config root
    // (OPENCODE_CONFIG_DIR / Orca shared dir often differs from ~/.config/opencode).
    const targets = new Set([configFile, ...resolveAllGlobalConfigFiles()]);
    for (const file of targets) {
        try {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            const cfg = fs.existsSync(file)
                ? readJSON(file)
                : { $schema: 'https://opencode.ai/config.json' };
            applyProviderToConfig(cfg, id, name, url, key, modelsV1, modelsV2, defaultModel);
            fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
        } catch (e) {
            console.error(`  warn: could not write provider to ${file}: ${e.message}`);
        }
    }
}

function getNaNModelConfig(id) {
    const common = { tool_call: true, reasoning: true };
    // deepseek-v4-flash and dated snapshots share the same profile
    if (id === 'deepseek-v4-flash' || id.startsWith('deepseek-v4-flash')) {
        return { ...common, name: `NaN ${id}`, limit: { context: 1_048_576, output: 65536 } };
    }
    if (id === 'mimo-v2.5' || id.startsWith('mimo-')) {
        return { ...common, name: `NaN ${id}`, limit: { context: 1_048_576, output: 65536 }, modalities: { input: ['text', 'image', 'audio'], output: ['text'] } };
    }
    if (id === 'gemma4' || id.startsWith('gemma')) {
        return { ...common, name: `NaN ${id}`, limit: { context: 262_144, output: 65536 }, modalities: { input: ['text', 'image'], output: ['text'] } };
    }
    if (id === 'qwen3.6' || id.startsWith('qwen')) {
        return { ...common, name: `NaN ${id}`, limit: { context: 262_144, output: 65536 }, modalities: { input: ['text', 'image'], output: ['text'] } };
    }
    // image generators etc. — still list them; tools off by default for non-chat
    if (id.includes('flux') || id.includes('image') || id.includes('dall')) {
        return { name: `NaN ${id}`, tool_call: false, modalities: { input: ['text'], output: ['image'] } };
    }
    return { name: `NaN ${id}`, tool_call: true };
}

function modelHint(id) {
    if (id.includes('deepseek')) return '284B MoE · 1M ctx · reasoning';
    if (id.includes('mimo')) return '310B MoE · omnimodal (text+vision+audio)';
    if (id.includes('gemma')) return '26B MoE · multimodal · vision';
    if (id.includes('qwen')) return '35B MoE · 256K ctx · multimodal';
    return '';
}

// ─── Target dirs per harness ──────────────────────────────
// Policy:
//   · Agents + commands are ALWAYS user-global (per harness). Never project-scoped.
//   · Skills: global → ~/.agents/skills (or harness-native skills dir);
//             project → .agents/skills in the current repo (OpenCode/OMO only).
//   · Claude / Codex / omp ignore scope and always install to their user dirs.
function harnessDirs(harnessId, scope, ocVersion) {
    const v = ocVersion === 'v1' ? { agents: 'agent', commands: 'command' } : { agents: 'agents', commands: 'commands' };
    if (harnessId === 'opencode' || harnessId === 'opencode2' || harnessId === 'omo') {
        // Agents/commands: primary CONFIG_DIR (respects OPENCODE_CONFIG_DIR).
        // Install loop also mirrors into other openCodeConfigDirs() when present.
        return {
            agents: path.join(CONFIG_DIR, v.agents),
            commands: path.join(CONFIG_DIR, v.commands),
            skills: scope === 'project'
                ? path.join(process.cwd(), '.agents', 'skills')
                : path.join(HOME, '.agents', 'skills'),
            _mirrorDirs: openCodeConfigDirs().filter((d) => path.resolve(d) !== path.resolve(CONFIG_DIR)),
        };
    }
    if (harnessId === 'omp') {
        // Oh My Pi: skills at ~/.omp/skills; it ALSO inherits .claude/.codex skills natively.
        return {
            agents: null,
            skills: path.join(HOME, '.omp', 'skills'),
            commands: null,
        };
    }
    if (harnessId === 'claude') {
        return {
            agents: path.join(HOME, '.claude', 'agents'),
            skills: path.join(HOME, '.claude', 'skills'),
            commands: path.join(HOME, '.claude', 'commands'),
        };
    }
    if (harnessId === 'codex') {
        return { agents: null, skills: path.join(HOME, '.codex', 'skills'), commands: null };
    }
    return null;
}

function scopeDirs(scope, ocVersion) {
    return harnessDirs('opencode', scope, ocVersion);
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
    console.log(BANNER);

    const { found, ocVersion } = detectHarnesses();
    const harnessOptions = HARNESSES.map((h) => ({
        label: h.label,
        value: h.id,
        hint: found.includes(h.id) ? P.ok('● detected') + '  ' + P.hint(h.hint) : P.hint(h.hint),
    }));

    // ── Step 1: which harnesses ───────────────────────────
    let chosen = [];
    let standalone = false;
    if (found.length === 0) {
        note(yellow('No harness detected — standalone skills mode.'));
        standalone = true;
    } else {
        note(gray(`Detected: ${found.join(', ')} · opencode config layout: ${ocVersion}`));
        const harnessPick = await multiselect({
            message: P.step('Step 1/8') + ' — Install for which harness(es)?',
            options: harnessOptions,
            initialValues: found,
        });
        if (isCancel(harnessPick)) process.exit(0);
        chosen = harnessPick;
    }

    // ── Step 2: opencode layout v1/v2 ─────────────────────
    let ocVersionFinal = ocVersion;
    if (chosen.includes('opencode') || chosen.includes('opencode2') || chosen.includes('omo')) {
        const versionPick = await select({
            message: P.step('Step 2/8') + ' — opencode config layout',
            options: [
                { label: 'v2 (current)', value: 'v2', hint: 'agents/ skills/ commands/ — recommended' },
                { label: 'v1 (legacy)', value: 'v1', hint: 'agent/ command/ — backwards compat' },
                { label: 'Both', value: 'both', hint: 'write to v1 AND v2' },
            ],
            initialValue: ocVersion,
        });
        if (isCancel(versionPick)) process.exit(0);
        ocVersionFinal = versionPick;
    }

    // ── Step 3: scope ─────────────────────────────────────
    const wantsOcLike = chosen.includes('opencode') || chosen.includes('opencode2') || chosen.includes('omo');
    let scope = 'global';
    if (wantsOcLike) {
        const scopePick = await select({
            message: P.step('Step 3/8') + ' — Skills where? (agents/commands are always global)',
            options: [
                { label: 'Global skills', value: 'global', hint: '~/.agents/skills · agents/commands → each harness user dir' },
                { label: 'Project skills only', value: 'project', hint: `.agents/skills in ${process.cwd()} · agents/commands still global` },
            ],
            initialValue: 'global',
        });
        if (isCancel(scopePick)) process.exit(0);
        scope = scopePick;
    }

    // ── Skills manifest ───────────────────────────────────
    let skillManifest = await getJSON(`${RAW}/skills/manifest.json`);
    if (!skillManifest || typeof skillManifest !== 'object') {
        skillManifest = Object.fromEntries(Object.entries(FALLBACK_SKILL_FILES).map(([k, files]) => [k, { files, hint: 'skill' }]));
    }
    const skillNames = Object.keys(skillManifest);

    const selected = { agents: [], skills: [], commands: [] };
    let mcps = [];
    let configFile = '';

    const fullMode = chosen.length > 0;
    if (fullMode) {
        // ── Step 4: Gauntlet pack ─────────────────────────
        note([
            P.brand('What is the Gauntlet Loop?'),
            '',
            '  A method made famous by Matt Shumer (Claude of Duty, 2026): give an agent',
            '  an ambitious goal and a REAL bar to beat, let it split the work into',
            '  pieces, and for each piece run:',
            '',
            '    split → build → BLIND CRITIC → repeat',
            '',
            '  The builder never grades its own work. A separate critic with fresh',
            '  context inspects the REAL artifact against the bar (tests, benchmarks,',
            '  screenshots of a reference) and only passes when it wins. Keep looping',
            '  until the artifact beats the bar — or you stop it.',
            '',
            '  This pack installs everything the method needs:',
            '    · /gauntlet command      (the loop driver)',
            '    · gauntlet-builder       (builds one piece)',
            '    · gauntlet-critic        (blind critic, edit: deny)',
            '    · gauntlet-smoother      (integrates pieces)',
            '    · gauntlet-loop skill    (full method + per-domain bar guides)',
        ].join('\n'));
        const pack = await confirm({
            message: P.step('Step 4/8') + ' — Install the Gauntlet Loop pack?',
            initialValue: true,
        });
        if (isCancel(pack)) process.exit(0);
        const wantPack = pack;

        // ── Step 5: Agents (one step, full list) ──────────
        const wantAgents = await confirm({
            message: P.step('Step 5/8') + ` — Install agents? (${AGENT_CATALOG.length} available)`,
            initialValue: true,
        });
        if (isCancel(wantAgents)) process.exit(0);
        if (wantAgents) {
            const initialAgents = wantPack ? [...GAUNTLET_PACK.agents] : [];
            selected.agents = await multiselect({
                message: P.accent('Agents') + ' — pick any (space)',
                options: AGENT_CATALOG.map((a) => ({ label: a.label, value: a.file, hint: a.desc || a.hint })),
                initialValues: initialAgents,
            });
            if (isCancel(selected.agents)) process.exit(0);
        }

        // ── Step 6: Skills (one step, full list) ──────────
        const wantSkills = await confirm({
            message: P.step('Step 6/8') + ` — Install skills? (${skillNames.length} available: ${skillNames.join(', ')})`,
            initialValue: true,
        });
        if (isCancel(wantSkills)) process.exit(0);
        if (wantSkills) {
            const initialSkills = wantPack ? [...GAUNTLET_PACK.skills] : [];
            selected.skills = await multiselect({
                message: P.accent('Skills') + ' — pick any (space)',
                options: Object.entries(skillManifest).map(([name, meta]) => ({ label: name, value: name, hint: meta.desc || meta.hint || '' })),
                initialValues: initialSkills,
            });
            if (isCancel(selected.skills)) process.exit(0);
        }

        // ── Step 7: Commands (one step, full list) ────────
        const wantCommands = await confirm({
            message: P.step('Step 7/8') + ` — Install slash commands? (${COMMAND_CATALOG.length} available)`,
            initialValue: true,
        });
        if (isCancel(wantCommands)) process.exit(0);
        if (wantCommands) {
            const initialCommands = wantPack ? [...GAUNTLET_PACK.commands] : [];
            selected.commands = await multiselect({
                message: P.accent('Commands') + ' — pick any (space)',
                options: COMMAND_CATALOG.map((cmd) => ({ label: cmd.label, value: cmd.file, hint: cmd.hint })),
                initialValues: initialCommands,
            });
            if (isCancel(selected.commands)) process.exit(0);
        }

        // ── Step 8: MCPs / provider / plugins (opencode/OMO only) ──
        if (wantsOcLike) {
            const wantMcps = await confirm({
                message: P.step('Step 8/8') + ' — Install MCP servers?',
                initialValue: false,
            });
            if (isCancel(wantMcps)) process.exit(0);
            if (wantMcps) {
                mcps = await multiselect({
                    message: P.accent('MCP Servers') + ' — pick any (space)',
                    options: [
                        { label: 'searxng', value: 'searxng', hint: 'web search — needs Docker' },
                        { label: 'arxiv', value: 'arxiv', hint: 'academic papers' },
                        { label: 'mdn', value: 'mdn', hint: 'MDN Web Docs + browser compat (remote)' },
                        { label: 'github', value: 'github', hint: 'PRs, issues, repos — needs GITHUB_TOKEN' },
                        { label: 'memory', value: 'memory', hint: 'persistent knowledge graph across sessions' },
                        { label: 'sequential-thinking', value: 'sequential-thinking', hint: 'structured multi-step reasoning' },
                        { label: 'clickhouse', value: 'clickhouse', hint: 'ClickHouse database queries' },
                        { label: 'azure', value: 'azure', hint: 'Azure resources (40+ services)' },
                        { label: 'database', value: 'database', hint: 'MySQL · PostgreSQL · SQLite · SQL Server' },
                        { label: 'sentry', value: 'sentry', hint: 'error tracking & issues (needs auth)' },
                    ],
                    initialValues: [],
                });
                if (isCancel(mcps)) process.exit(0);
            }

            // Agents/commands are always global → MCP/provider config always user-global too
            configFile = resolveConfigFile('global');

            if (mcps.length > 0) {
                const frag = await getText(`${RAW}/opencode.json`);
                if (frag) {
                    try {
                        const cfg = readJSON(configFile);
                        const fragment = JSON.parse(frag.replace(/^\uFEFF/, '').trim());
                        if (!cfg.mcp) cfg.mcp = {};
                        for (const key of mcps) if (fragment.mcp?.[key]) cfg.mcp[key] = fragment.mcp[key];
                        fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2));
                    } catch (e) { note(yellow(`MCP merge failed: ${e.message}`)); }
                }
            }
        }

        // Provider (optional, one step)
        if (wantsOcLike) {
            const wantProvider = await confirm({ message: 'Add a provider? (NaN / custom OpenAI-compatible)', initialValue: false });
            if (isCancel(wantProvider)) process.exit(0);
            if (wantProvider) {
                const providerChoice = await select({
                    message: 'Provider',
                    options: [
                        { label: 'NaN', value: 'nan', hint: '70 €/month · unlimited tokens · cloud.nan.builders/r/F6K91G94' },
                        { label: 'Custom', value: 'custom', hint: 'any OpenAI-compatible API' },
                    ],
                    initialValue: 'nan',
                });
                if (isCancel(providerChoice)) process.exit(0);

                if (providerChoice === 'nan') {
                    const pid = 'nan'; const pname = 'NaN'; const purl = 'https://api.nan.builders/v1';
                    note(gray('Get unlimited tokens → ') + cyan('https://cloud.nan.builders/r/F6K91G94') + gray(' (70 €/month)'));
                    const pkey = await password({ message: 'NaN API key (get one at cloud.nan.builders)', mask: '*' });
                    if (isCancel(pkey)) process.exit(0);
                    const key = typeof pkey === 'string' ? pkey.trim() : '';
                    const authHeader = key ? { Authorization: `Bearer ${key}` } : {};

                    const spinModels = spinner();
                    spinModels.start('Fetching NaN model list…');
                    const models = await getJSON(`${purl}/models`, authHeader, { timeout: 20000 });
                    const apiList = Array.isArray(models?.data) ? models.data : [];
                    spinModels.stop(apiList.length
                        ? `Fetched ${apiList.length} model(s) from NaN`
                        : 'Could not fetch live list — using known NaN models');

                    // Always offer a full picker: known models ∪ live API (chat only)
                    const options = mergeModelOptions(apiList, KNOWN_NAN_MODELS);
                    note([
                        P.brand('Choose the default OpenCode model for NaN'),
                        gray('  ↑/↓ move · Enter confirm · all listed models are registered in your config'),
                        '',
                        ...options.map((o) => `  · ${o.label}${o.hint ? gray('  — ' + o.hint) : ''}`),
                    ].join('\n'));

                    const pmodel = await select({
                        message: 'Default NaN model',
                        options,
                        initialValue: options.find((o) => o.value === 'deepseek-v4-flash')?.value || options[0]?.value,
                    });
                    if (isCancel(pmodel) || !pmodel) process.exit(0);

                    const modelsCfg = {};
                    for (const o of options) modelsCfg[o.value] = getNaNModelConfig(o.value);
                    writeProvider(configFile, pid, pname, purl, key, modelsCfg, pmodel);
                    note(green(`Provider NaN saved · default model = nan/${pmodel}`));
                } else {
                    const pid = await text({ message: 'Provider ID (e.g. myprovider)', initialValue: 'myprovider' });
                    if (isCancel(pid)) process.exit(0);
                    const pname = await text({ message: 'Display name', initialValue: 'My Provider' });
                    if (isCancel(pname)) process.exit(0);
                    const purl = await text({ message: 'Base URL', initialValue: 'https://api.example.com/v1' });
                    if (isCancel(purl)) process.exit(0);
                    const pkey = await password({ message: 'API key (optional)', mask: '*' });
                    if (isCancel(pkey)) process.exit(0);
                    const key = typeof pkey === 'string' ? pkey.trim() : '';
                    const authHeader = key ? { Authorization: `Bearer ${key}` } : {};

                    const spinModels = spinner();
                    spinModels.start('Fetching model list…');
                    const models = await getJSON(`${purl}/models`, authHeader, { timeout: 20000 });
                    const apiList = Array.isArray(models?.data) ? models.data : [];
                    spinModels.stop(apiList.length ? `Fetched ${apiList.length} model(s)` : 'No live list — type a model name');

                    let pmodel;
                    if (apiList.length > 0) {
                        const options = mergeModelOptions(apiList);
                        note(options.map((o) => `  · ${o.label}`).join('\n'));
                        pmodel = await select({ message: 'Default model', options, initialValue: options[0]?.value });
                    } else {
                        pmodel = await text({ message: 'Default model name', initialValue: 'gpt-4o' });
                    }
                    if (!isCancel(pmodel) && pmodel) {
                        const modelIds = apiList.length > 0 ? mergeModelOptions(apiList).map((o) => o.value) : [pmodel];
                        const customModels = {};
                        for (const mId of modelIds) customModels[mId] = { name: `${pname} ${mId}`, tool_call: true };
                        writeProvider(configFile, pid, pname, purl, key, customModels, pmodel);
                        note(green(`Provider ${pid} saved · default model = ${pid}/${pmodel}`));
                    }
                }
            }

            const wantPlugins = await confirm({ message: 'Install TimeFly plugin? (dev metrics)', initialValue: false });
            if (isCancel(wantPlugins)) process.exit(0);
            if (wantPlugins) {
                note('Setting up TimeFly plugin...');
                run('bunx @timefly/opencode-plugin setup-opencode -- --target user 2>nul || npx @timefly/opencode-plugin setup-opencode -- --target user 2>nul', { inherit: true });
                const timeflyCfg = path.join(CONFIG_DIR, 'opencode.json');
                if (configFile.endsWith('.jsonc') && fs.existsSync(timeflyCfg)) {
                    try {
                        const timeflyContent = readJSON(timeflyCfg);
                        if (timeflyContent.plugin) {
                            const userCfg = readJSON(configFile);
                            userCfg.plugin = timeflyContent.plugin;
                            fs.writeFileSync(configFile, JSON.stringify(userCfg, null, 2));
                            fs.unlinkSync(timeflyCfg);
                        }
                    } catch (e) { note(yellow(`TimeFly merge: ${e.message}`)); }
                }
                const doLogin = await confirm({ message: 'Log in to TimeFly? (interactive browser/CLI)', initialValue: true });
                if (doLogin) {
                    note(gray('Handing terminal to TimeFly login — complete it, then we continue…'));
                    run('bunx @timefly/opencode-plugin login || npx @timefly/opencode-plugin login', { inherit: true });
                }
            }

            // Always ask which primary agent is default (even if one was set before)
            const primaryFiles = ['research.md', 'deep-research.md', 'code.md', 'docs-writer.md'];
            const installedPrimary = selected.agents.filter((a) => primaryFiles.includes(a));
            if (installedPrimary.length > 0) {
                try {
                    const cfg = readJSON(configFile);
                    const current = cfg.default_agent || 'code';
                    const da = await select({
                        message: 'Default agent (OpenCode tab on start)',
                        options: installedPrimary.map((f) => ({
                            label: f.replace('.md', ''),
                            value: f.replace('.md', ''),
                            hint: f.replace('.md', '') === current ? 'current' : '',
                        })),
                        initialValue: installedPrimary.some((f) => f.replace('.md', '') === current) ? current : 'code',
                    });
                    if (!isCancel(da) && da) {
                        cfg.default_agent = da;
                        fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2));
                        note(green(`Default agent = ${da}`));
                    }
                } catch (e) { note(yellow(`default_agent: ${e.message}`)); }
            }
        }
    }

    // ── Standalone: skills only ───────────────────────────
    if (standalone && selected.skills.length === 0) {
        const destOptions = [
            { label: '~/.agents/skills', value: path.join(HOME, '.agents', 'skills'), hint: 'Agent Skills standard — OpenCode, Claude, Codex, …' },
            { label: '.agents/skills (current project)', value: path.join(process.cwd(), '.agents', 'skills'), hint: 'project-scoped standard path' },
            { label: '~/.claude/skills', value: path.join(HOME, '.claude', 'skills'), hint: 'Claude Code + Oh My Pi' },
            { label: '~/.config/opencode/skills', value: path.join(CONFIG_DIR, 'skills'), hint: 'OpenCode-native global (optional)' },
            { label: '.opencode/skills (current project)', value: path.join(process.cwd(), '.opencode', 'skills'), hint: 'OpenCode-native project path' },
            { label: 'Custom path', value: '__custom__', hint: 'type your own' },
        ];
        const destChoice = await select({ message: 'Install skills where?', options: destOptions, initialValue: path.join(HOME, '.agents', 'skills') });
        if (isCancel(destChoice)) process.exit(0);
        let dest = destChoice;
        if (dest === '__custom__') {
            dest = await text({ message: 'Destination path', placeholder: '/path/to/skills' });
            if (isCancel(dest) || !dest) process.exit(0);
        }
        selected.skills = await multiselect({
            message: P.accent('Skills') + ' — pick any (space)',
            options: Object.entries(skillManifest).map(([name, meta]) => ({ label: name, value: name, hint: meta.desc || meta.hint || '' })),
            initialValues: skillNames.includes('gauntlet-loop') ? ['gauntlet-loop'] : (skillNames.length ? [skillNames[0]] : []),
        });
        if (isCancel(selected.skills)) process.exit(0);

        const spin = spinner();
        spin.start('Installing skills...');
        let total = 0;
        for (const name of selected.skills) {
            const files = normalizeSkillFiles(skillManifest[name]?.files, name);
            total += await downloadSkill(name, path.join(dest, name), files);
        }
        spin.stop(`Installed ${selected.skills.length} skill(s) (${total} files) → ${dest}`);
        outro(bold('Done! Skills are now available to agents that load skills.'));
        process.exit(0);
        return;
    }

    // ── Install to each chosen harness ────────────────────
    const spin = spinner();
    spin.start('Installing...');
    const totals = {};
    for (const harnessId of chosen) {
        const vFinal = ocVersionFinal === 'both' ? ['v1', 'v2'] : [ocVersionFinal];
        for (const v of vFinal) {
            const dirs = harnessDirs(harnessId, scope, v);
            if (!dirs) continue;
            const key = `${harnessId}(${v})`;
            totals[key] = { agents: 0, skills: 0, commands: 0 };

            for (const agent of selected.agents) {
                if (!dirs.agents) break;
                fs.mkdirSync(dirs.agents, { recursive: true });
                if (await download(`${RAW}/agents/${agent}`, path.join(dirs.agents, agent))) totals[key].agents++;
                // Mirror into extra OpenCode config roots (e.g. Orca OPENCODE_CONFIG_DIR)
                for (const mirror of dirs._mirrorDirs || []) {
                    const agentDir = path.join(mirror, path.basename(dirs.agents));
                    fs.mkdirSync(agentDir, { recursive: true });
                    await download(`${RAW}/agents/${agent}`, path.join(agentDir, agent));
                }
            }
            for (const name of selected.skills) {
                if (!dirs.skills) break;
                const files = normalizeSkillFiles(skillManifest[name]?.files, name);
                totals[key].skills += await downloadSkill(name, path.join(dirs.skills, name), files);
            }
            for (const cmd of selected.commands) {
                if (!dirs.commands) break;
                fs.mkdirSync(dirs.commands, { recursive: true });
                if (await download(`${RAW}/commands/${cmd}`, path.join(dirs.commands, cmd))) totals[key].commands++;
                for (const mirror of dirs._mirrorDirs || []) {
                    const cmdDir = path.join(mirror, path.basename(dirs.commands));
                    fs.mkdirSync(cmdDir, { recursive: true });
                    await download(`${RAW}/commands/${cmd}`, path.join(cmdDir, cmd));
                }
            }
        }
    }
    spin.stop('Install complete');

    if (mcps.length > 0 && !process.env.AGENTKIT_SKIP_NPM) {
        const pkgs = {
            searxng: 'one-search-mcp', arxiv: '@cyanheads/arxiv-mcp-server', github: '@github/github-mcp-server',
            memory: '@modelcontextprotocol/server-memory', 'sequential-thinking': '@modelcontextprotocol/server-sequential-thinking',
            clickhouse: 'clickhouse-mcp-server', sentry: '@sentry/mcp-server', azure: '@azure/mcp', database: '@executeautomation/database-server',
        };
        for (const mcp of mcps) { const pkg = pkgs[mcp]; if (pkg) run(`npm pack ${pkg} 2>/dev/null`); }
    }

    const summaryLines = [`  ${P.brand('Mode:')}    ${fullMode ? 'full' : 'standalone'}`, `  ${P.brand('Harness:')} ${chosen.join(', ') || 'standalone'}`];
    if (wantsOcLike) summaryLines.push(`  Layout:  ${ocVersionFinal} (${scope})`);
    for (const [key, t] of Object.entries(totals)) {
        summaryLines.push(`  ${key}: agents=${t.agents} skills=${t.skills} commands=${t.commands}`);
    }
    if (configFile) summaryLines.push(`  Config:  ${configFile}`);
    if (ENV_CONFIG_DIR) {
        summaryLines.push(`  ${P.warn('OPENCODE_CONFIG_DIR:')} ${CONFIG_DIR}`);
        summaryLines.push(`  ${P.hint('(also wrote ~/.config/opencode — Orca/opencode2 uses OPENCODE_CONFIG_DIR)')}`);
    }
    if (mcps.length) summaryLines.push(`  MCPs:    ${mcps.join(', ')}`);
    summaryLines.push(`  ${P.brand('Gauntlet:')} ${fullMode && (selected.agents.some((a) => a.includes('gauntlet')) || selected.skills.includes('gauntlet-loop')) ? 'yes' : 'no'}`);
    note(summaryLines.join('\n'));

    if (mcps.includes('searxng')) note([yellow('SearXNG (needs Docker):'), gray('  docker run -d --name searxng -p 8080:8080 searxng/searxng')].join('\n'));

    outro(bold('Done! Restart your harness(es). Agents appear as tabs, commands as /commands, skills auto-load.'));
    process.exit(0);
}

function isMainModule() {
    const entry = process.argv[1];
    if (!entry) return false;
    try {
        const self = path.resolve(fileURLToPath(import.meta.url));
        const started = path.resolve(entry);
        return process.platform === 'win32'
            ? self.toLowerCase() === started.toLowerCase()
            : self === started;
    } catch {
        return import.meta.url === pathToFileURL(path.resolve(entry)).href;
    }
}

if (isMainModule()) {
    main().catch((e) => {
        console.error('\n  AgentKit error:', e?.message || e);
        if (e?.stack) console.error(e.stack);
        process.exit(1);
    });
}

// ─── Exports (for testing / embedding) ────────────────────
export { readJSON, getJSON, getText, download, downloadSkill, detectHarnesses, harnessDirs, scopeDirs, AGENT_CATALOG, COMMAND_CATALOG, GAUNTLET_PACK, FALLBACK_SKILL_FILES, HARNESSES };



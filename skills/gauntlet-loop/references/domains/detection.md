# Domain: Detection Engineering (blue team) — ATT&CK coverage with zero false positives

> How to pick the **bar for detection rules** plus a multi-platform worked example. Bar = **fires on the target MITRE ATT&CK technique** **and** **zero false positives on benign data**. The logic is platform-agnostic; examples are given in parallel for **Splunk SPL, Sentinel/Defender KQL, CrowdStrike, and Sigma**.

## When to use it

Writing a new detection rule for an ATT&CK technique, tuning a noisy rule down, or building coverage for a tactic.

## Choosing the bar for detection (two required criteria)

1. **True positive:** the rule **fires** on attack data for the target technique — from a lab or emulation (Atomic Red Team) or from captured attack logs.
2. **Zero false positives:** the rule stays **silent** on a representative set of **benign logs** from the environment. Any hit on benign data is a **FAIL**, not negotiable.

Recommended on top: **robustness** (trivial variations do not evade it), enough **context** in the alert to triage, and acceptable **query performance**.

Map every rule to a **MITRE ATT&CK technique ID** (e.g. T1059 Command & Scripting Interpreter, T1003 OS Credential Dumping, T1053 Scheduled Task, T1078 Valid Accounts, T1547 Boot/Logon Autostart).

## Mapping onto the loop

- **LEAD:** picks the ATT&CK technique and prepares two datasets (attack + benign); splits by variant or log source.
- **BUILDER:** writes the rule (SPL/KQL/CrowdStrike/Sigma); the artifact is the query.
- **CRITIC (blind):** **runs the rule for real** against both datasets. PASS only if it fires on attack data **and** returns zero hits on benign data; then tries evasion variants to test robustness.

## The loop

1. Choose the technique; collect attack data (emulation) and representative benign data.
2. BUILDER writes the rule — start broad enough to catch it, then narrow.
3. CRITIC runs it against benign data. On a false positive, identify **which benign log** matched and why → the builder adds a **justified** exclusion (never a blanket one that blinds the rule).
4. CRITIC runs it against attack data plus variants — it must still fire. Repeat until both criteria hold.
5. Ship the rule + ATT&CK mapping + TP/FP numbers + tuning notes.

## What the critic must do

- **Run the query for real** on the benign set (count hits) and on the attack set (confirm it fires).
- For each false positive, **trace it back** to the source log and find the distinguishing signal (parent process, path, signer, user context) — never just mute it.
- Attempt **trivial evasion** (different casing, encoding, alternative LOLBins) to gauge robustness.

---

## Worked example (multi-platform) — T1053.005 Scheduled Task

> Technique: **MITRE ATT&CK T1053.005 — Scheduled Task/Job: Scheduled Task** (an attacker creates a scheduled task for execution or persistence on Windows).
> Bar: fires on malicious scheduled-task creation **and** produces zero false positives on benign logs. The same logic is expressed on several platforms — use whichever you run.

Data sources: Windows Security Event **4698** (a scheduled task was created), or `schtasks.exe` process creation via 4688 / Sysmon EventID 1. Emulation: Atomic Red Team T1053.005.

### Round 1 — BUILDER writes a broad rule (catch it first)

**Splunk (SPL)**
```spl
index=win (EventCode=4698 OR (EventCode=4688 AND New_Process_Name="*\\schtasks.exe" AND Process_Command_Line="*/create*"))
| stats count min(_time) as firstTime by host, user, Process_Command_Line, Task_Name
```

**Microsoft Sentinel / Defender (KQL)**
```kql
// Defender for Endpoint
DeviceProcessEvents
| where FileName =~ "schtasks.exe" and ProcessCommandLine has "/create"
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, ProcessCommandLine
// (or SecurityEvent | where EventID == 4698 ... if you collect 4698)
```

**CrowdStrike (Falcon event search)**
```
event_simpleName=ProcessRollup2 FileName=schtasks.exe CommandLine=*/create*
// or use ScheduledTask telemetry if available; return host, UserName, ParentBaseFileName, CommandLine
```

**Sigma (portable across SIEMs)**
```yaml
title: Scheduled Task Creation via schtasks.exe
id: 8e3b1a2c-0000-4a00-9c00-t1053005exmpl
status: experimental
logsource: { category: process_creation, product: windows }
detection:
  selection:
    Image|endswith: '\schtasks.exe'
    CommandLine|contains: '/create'
  condition: selection
level: medium
tags: [attack.persistence, attack.t1053.005]
```

### Round 1 — CRITIC (blind) runs it on benign data

Run over 30 days of benign logs → **false positives appear**:
- Legitimate management/EDR/backup software creating scheduled tasks at install time (parent is a signed installer, running as `SYSTEM`, task path under `\Microsoft\...`).
- GPO or administrators creating routine maintenance tasks.

**Round 1 verdict: FAIL** — fires on attack data (good) but **more than zero false positives** on benign data. It needs justified narrowing, not blinding.

Distinguishing signals the critic proposes, derived from the benign logs themselves:
- Exclude parent processes that are **signed and on a known allow-list** (installers, EDR agents).
- Prefer suspicious indicators: the task runs a binary from a user or temp path, or the command contains `powershell -enc`, `cmd /c`, or a LOLBin.
- User context: created by a regular user rather than through a legitimate SYSTEM/admin channel.

### Round 2 — BUILDER narrows (while still catching the attack)

**Splunk (SPL) — justified exclusions**
```spl
index=win EventCode=4688 New_Process_Name="*\\schtasks.exe" Process_Command_Line="*/create*"
| eval susp=if(match(Process_Command_Line,"(?i)(powershell.*-enc|\\\\Users\\\\|\\\\Temp\\\\|cmd\s+/c|mshta|rundll32)"),1,0)
| search susp=1
| `exclude_known_admin_parents(Parent_Process_Name)`   ``` macro: allow-list of signed parents ```
| stats count min(_time) as firstTime by host, user, Parent_Process_Name, Process_Command_Line
```

**Sentinel (KQL) — exclusions plus context**
```kql
DeviceProcessEvents
| where FileName =~ "schtasks.exe" and ProcessCommandLine has "/create"
| where ProcessCommandLine has_any ("powershell","-enc","\\Users\\","\\Temp\\","cmd /c","mshta","rundll32")
| where InitiatingProcessSignatureStatus != "Valid"          // parent is not validly signed
       or InitiatingProcessAccountName !in ("SYSTEM")          // or not via an admin/SYSTEM channel
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, ProcessCommandLine
```

**Sigma — with filters**
```yaml
detection:
  selection:
    Image|endswith: '\schtasks.exe'
    CommandLine|contains: '/create'
  suspicious:
    CommandLine|contains:
      - 'powershell'
      - '-enc'
      - '\Users\'
      - '\Temp\'
      - 'mshta'
      - 'rundll32'
  filter_known_admin:
    ParentImage|endswith:
      - '\TrustedInstaller.exe'
      - '\ccmexec.exe'      # example: a management agent known in this environment
  condition: selection and suspicious and not filter_known_admin
```

### Round 2 — CRITIC (blind) reruns
- **Benign (30 days):** 0 hits — the legitimate admin tasks are excluded on justified grounds.
- **Attack (Atomic Red Team T1053.005 + variants):**
  - `schtasks /create ... powershell -enc <b64>` → fires
  - variant invoking a binary from `\Users\Public\` → fires
  - LOLBin variant using `rundll32` → fires
- **Robustness:** case changes and extra whitespace still fire (case-insensitive matching). Recorded limitation: an attacker registering a task directly through the COM `ITaskService` API instead of `schtasks.exe` would not be covered — that needs a companion rule on EventID 4698 (task registration), queued for the next round.

**Verdict: PASS** — fires on the attack and its variants, **zero false positives** on benign data.

### Shipping output
- The rule for each target platform + **ATT&CK: T1053.005**.
- Numbers: TP on attack = 3/3 variants; FP on benign = 0.
- Justified exclusions: signed/allow-listed parents, SYSTEM context.
- Recorded gap: task creation via the COM API is not covered (companion rule on 4698).

> Note: the benign dataset must be **representative** of the real environment. "Zero false positives" only means zero on the data you tested. Re-validate periodically as the environment changes.

## Output

The final rule per target platform + the **ATT&CK technique ID** + TP/FP counts on both datasets + the list of justified exclusions + recorded coverage gaps.

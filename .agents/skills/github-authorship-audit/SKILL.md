---
name: github-authorship-audit
description: Scans Git history, commit trailers, author identity, and codebase text to ensure ZERO automated AI or bot credits exist.
---

# GitHub Authorship Audit Skill

## When to Use

Use before every Git commit, before pushing to GitHub (`arslanvuzmal/voxdesk-ai`), and prior to final project completion.

## Inputs Required

- Local Git log and configuration.
- Project repository root files.

## Step-by-Step Process

1. Inspect git identity:
   `git config --get user.name` -> MUST BE `Arslan Vuzmal Lone`
   `git config --get user.email` -> MUST BE `arslanvuzmallone@gmail.com`
2. Scan commit log history:
   `git log --format="%h | AUTHOR=%an <%ae> | COMMITTER=%cn <%ce> | %s" -30`
3. Search for forbidden attribution strings across entire codebase:
   "Co-Authored-By:", "Generated-By:", "Built with Antigravity", "Created by Gemini", "Claude", "Anthropic", "AI-generated repository", "Antigravity-Session:".
4. Confirm `docs/AUTHORSHIP_AUDIT.md` status displays:
   `AUTOMATED ASSISTANT CONTRIBUTOR STATUS: NOT PRESENT — VERIFIED`

## Decision Tree

- **Is any forbidden attribution string or improper author found?**
  - YES -> BLOCK COMMIT/PUSH -> Fix git config / scrub commit log -> Re-audit.
  - NO -> Pass authorship audit.

## Validation Checklist

- [ ] Sole Author & Committer: Arslan Vuzmal Lone <arslanvuzmallone@gmail.com>.
- [ ] 0 AI co-author trailers in any commit message.
- [ ] README and package manifests credit Arslan Vuzmal Lone exclusively.

## Failure Conditions

- Presence of any AI assistant credit or mismatched git author identity.

## Expected Output

Verified `AUTHORSHIP_AUDIT.md` confirming 100% clean human authorship status.

# GitHub Repository Settings

A read-only repository-settings check on 2026-08-12 verified that private vulnerability reporting is enabled. It also found one repository ruleset named `just !` with enforcement set to `disabled`.

The connected integration could not read default workflow-token permissions, CodeQL default setup, Dependabot alert settings, secret scanning, or push protection. Those controls must be confirmed in GitHub by the repository owner; this document does not represent them as verified.

## Required owner actions

1. Open **Settings → Rules → Rulesets**.
2. Replace or rename the disabled `just !` ruleset with a clear `Protect main` ruleset.
3. Target the default branch and set enforcement to **Active**.
4. Block force pushes and branch deletion.
5. Require a pull request and resolved conversations.
6. Require these checks after their names are confirmed on a merged run:
   - `Repository validation`
   - `Unit, integration, and security tests`
   - `Production build`
   - `Browser acceptance`
   - `dependency-review`
7. Keep the solo-maintainer configuration practical: do not require an unavailable external reviewer. Allow an administrator bypass only for documented incident recovery.
8. Prefer squash merging for a concise release history.
9. Open **Settings → Actions → General** and confirm the default `GITHUB_TOKEN` permission is read-only.
10. Open **Settings → Code security** and confirm Dependency Graph, Dependabot alerts/security updates, secret scanning, push protection, private vulnerability reporting, and CodeQL default setup.
11. Do not enable an advanced CodeQL workflow while default setup is active.

GitHub documents repository rulesets at <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>.

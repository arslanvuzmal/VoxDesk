# GitHub Repository Settings

Repository metadata, topics, Dependabot alerts/security updates, secret scanning, push protection, private vulnerability reporting, and GitHub code scanning default setup were enabled or verified during the repository-professionalization change. The remaining controls require an owner to make an intentional branch-governance decision.

## Recommended controls

1. Create a `main` ruleset: require pull requests, require the `Repository validation`, `Unit, integration, and security tests`, `Production build`, and `Browser acceptance` checks; block force pushes and deletion; allow the solo maintainer to bypass only for incident recovery.
2. Prefer squash merge for a concise release history. Do not require an external reviewer in a solo-maintainer repository.
3. Revisit code scanning only if the default setup no longer covers the repository languages or a deliberate advanced CodeQL query configuration is needed. Do not run default and advanced setup together.

Rulesets are documented by GitHub at <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>.

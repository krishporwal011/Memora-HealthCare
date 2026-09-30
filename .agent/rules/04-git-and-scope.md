# Rule 04: Git, scope, commands
- One agent, one branch, one outcome (about 2 hours of work). No drive-by refactors.
- Commit messages: `type(scope): summary` (feat, fix, test, docs, chore).
- Allowed without asking: read files, run tests, lint, type-check, run the dev server.
- Ask first: install/upgrade deps, network calls to new hosts, deleting files, DB migrations, anything outside TOUCH ONLY paths.
- Never run: `rm -rf` outside build folders, `git push --force`, `git reset --hard` on shared branches, commands that print env vars.

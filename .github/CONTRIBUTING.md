# Contributing

Bug reports and pull requests are welcome. For anything larger than a fix, open an issue first so the approach is agreed before you write the code.

## Setup

You need Node 20 or later, and the pnpm version pinned in `package.json` (`corepack enable` picks it up).

```bash
pnpm install
pnpm dev
```

The library lives at the root, in `src/`. `pnpm dev` starts the documentation site in `playground/`, which uses the built package: run `pnpm run build:lib` after changing `src/` to see it there.

Read `src/NOTES.md` before changing the geometry, gesture or rendering code. Several changes that look like obvious wins there have been measured and rejected.

## Before opening a pull request

Run the checks CI runs:

```bash
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm test
pnpm run build:lib
```

`dist/` is committed. If you change `src/`, commit the rebuilt `dist/` with it. CI fails when the two disagree.

Add a test in `test/` for the behavior you fix or add. If the change touches the API, update the README and the documentation site too.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `fix: …`, `feat: …`, `docs: …`, `chore: …`. Keep one change per pull request.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](../LICENSE).

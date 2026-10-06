# docker-mutagen

Keeps a repository and a Docker container in sync with [mutagen](https://mutagen.io/): one
`one-way-safe` session for the whole repository, plus a `two-way-safe` session for every path the app
writes inside the container and which has to come back to the host.

Built for development on Windows, where a bind mount of the repository into the container is slow,
because every file read inside the container crosses the Windows↔WSL2 boundary. The container gets
its files from a Docker volume that mutagen fills in the background instead.

## Why more than one session

In mutagen the synchronization mode is a **per-session** setting, not a per-path one. A repository is
almost entirely "host wins": sources go one way, and runtime files created in the container (caches,
logs) must never be deleted just because they do not exist on the host — that is `one-way-safe`.

A handful of files break that rule: a settings panel writing its own config, a CLI command generating
translations, a price list edited in the app. For those, `one-way-safe` is actively harmful — it
refuses to overwrite a file changed in the container, so the session reports a conflict and the host
version never arrives, while the container's version never comes back. Each of them therefore gets
its own session in `two-way-safe`, and is excluded from the main session's ignore list automatically,
so the two sessions cannot fight over the same file.

## Installation

Not published to npm; install straight from GitHub, pinned to a tag:

```json
{
  "devDependencies": {
    "docker-mutagen": "github:jacekkarczmarczyk/docker-mutagen#v1.0.0"
  }
}
```

`pnpm` records the resolved commit in the lockfile, so the install is reproducible; bumping means
changing the tag. The package is TypeScript compiled by a `prepare` script, so a git install builds
it on the spot — no registry and no committed build output involved.

Requires `mutagen` in PATH (the plain `mutagen`, **not** `mutagen-compose`, which has been
unmaintained since 2025), Docker, and Node 20+.

## Usage

```
docker-mutagen <up|ensure|stop|status|resync|conflicts|verify> [--no-sync] [--build] [--all]
```

`pnpm` falls back to `node_modules/.bin`, so `pnpm docker-mutagen up` works as is. Projects that
prefer their own name can alias it in `package.json` and set `commandName` so that the messages match:

```json
{
  "scripts": {
    "docker": "docker-mutagen"
  }
}
```

| Command | What it does |
| --- | --- |
| `up` | Starts the containers (`docker compose up -d`). In sync mode also makes sure the sessions exist and waits until they report `watching` — only then does the container have a complete set of files. |
| `ensure` | Makes sure the container and (in sync mode) mutagen are running **without changing the mode** the container stands in. Meant for dev server scripts: a container deliberately started with `--no-sync` stays on its bind mount. |
| `stop` | `docker compose down` plus `mutagen sync pause`, so the next `up` resumes without a full rescan. |
| `status` | Container state and mode, then one line per session: status, successful cycles, conflicts, problems — and a one-line summary with the command to run next. |
| `resync` | Terminates this project's sessions and creates them from scratch. The emergency path; a changed config does not need it (see below). |
| `conflicts` | Conflicts plus scan and write problems of every session. Exits 1 if there is anything. |
| `verify` | Flushes the sync and compares sha1 sums of host and container files. A `watching` status does not prove everything arrived — the watcher can miss a mass change, e.g. after switching branches. |

Flags: `--no-sync` runs the container on a plain bind mount instead of the volume plus mutagen (only
with `up`), `--build` rebuilds the images first (only with `up`), `--all` makes `verify` check the
whole repository instead of the configured paths.

### Two statuses that lie

- A session with a **write problem** (`transitionProblems`, e.g. `unable to walk to transition root
  parent` when the parent directory of a session root is missing) still reports `watching`. It looks
  healthy while having delivered nothing — `status` counts those problems and `conflicts` prints them.
- `watching` also does not mean the container is up to date, only that mutagen believes it is. That is
  what `verify` is for.

## Configuration

Put `docker-mutagen.config.mjs` next to the project's `package.json`:

```js
import { defineConfig } from 'docker-mutagen';

export default defineConfig({
  projectName: 'myapp',
  containerName: 'myapp-php-apache',
  commandName: 'pnpm run docker',
  ignores: ['node_modules', '/vendor', '/.cache'],
  twoWayPaths: [
    { name: 'local-config', path: 'app/config/local.json' },
  ],
  containerOnlyDirs: ['cache/core', '/logs'],
  chmodPaths: ['public/data-runtime'],
  verifyPaths: ['app', 'public'],
});
```

The config file and the repository root are looked up separately, both walking up from the directory
the command was run in: the config lives next to `package.json` (which is not always the repository
root — it may sit in a `web/` subdirectory), while the synchronization root is always the directory
holding `.git`. That is why no path in the config is relative to the config file, and why the command
works from any directory of the repository.

| Option | Default | Meaning |
| --- | --- | --- |
| `projectName` | — | Required. Becomes the `project=<projectName>` label on every session, which is how `stop`, `resync` and `status` find them. |
| `containerName` | — | Required. The container receiving the files. |
| `sessionName` | `<projectName>-sync` | Name of the main session; two-way sessions are `<sessionName>-<name>`. |
| `containerRoot` | `/var/www/html` | Where the repository lives inside the container. |
| `composeDir` | `docker` | Directory with the compose files, relative to the repository root. |
| `composeFile` | `docker-compose.yml` | |
| `syncComposeFile` | `docker-compose.sync.yml` | The override that swaps the bind mount for the Docker volume. |
| `commandName` | `docker-mutagen` | Used in messages only — set it to however the project invokes the command. |
| `ignores` | `[]` | Main session ignores, git syntax (see below). |
| `twoWayPaths` | `[]` | `{ name, path }` entries; `path` is relative to the repository root and may be a directory or a single file. |
| `containerOnlyDirs` | `[]` | Directories written only in the container; ignored by the main session and created by `up` (`mkdir -p` + `chown www-data`). |
| `chmodPaths` | `[]` | Paths `up` chmods to 777 in the container. |
| `verifyPaths` | `['.']` | Default scope of `verify`. |
| `verifyListLimit` | `20` | How many files `verify` lists per category. |
| `syncTimeoutMs` | `300000` | How long `up` waits for `watching`. |
| `beta` | www-data (`id:33`), `0644`/`0755` | Owner, group and modes of files mutagen creates in the container. |
| `ignoreVcs` | `true` | Whether the main session skips `.git`, `.svn`, `.hg`, `_darcs`. |

### Ignore syntax

Mutagen's ignores are git-like: a bare name (`node_modules`) matches a path segment at any depth,
while a leading slash anchors the pattern at the session root. Anchor whatever exists only at the
root — an unanchored `vendor` also cuts out `public/vendor` and `app/js/vendor`, which usually breaks
the app in a way that looks nothing like a sync problem.

`verify` applies the same list with the same semantics, so files that are deliberately not
synchronized are not reported as differences.

### Changing the config

A session's configuration (mode, roots, ignore list) is frozen when the session is created. Each
session therefore carries a `config-hash` label, and the next `up` notices the drift and recreates
that session by itself. Worth knowing: any change to how the create arguments are built — even the
order of flags — changes the hash and triggers one full rescan.

## Releases

`pnpm run release` on the `dev` branch: lint, build, `cz-update-version` (major for a `breaking`
commit, minor for a `feat`, patch otherwise), then `cz-commit --push --push-tags`, which tags
`v<version>` and syncs `dev` into `main`.

## License

MIT

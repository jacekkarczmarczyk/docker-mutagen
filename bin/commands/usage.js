export function usage(config) {
    const name = config.commandName;
    return `Usage: ${name} <up|ensure|stop|status|resync|conflicts|verify> [--no-sync] [--build] [--all]

Commands:
  up         Starts the containers (docker compose up -d). In sync mode (the default) it also makes
             sure the mutagen sessions exist and waits until they have synchronized the files.
  ensure     Makes sure the container and (in sync mode) mutagen are running, without changing the
             mode the container stands in. Meant for dev server scripts.
  stop       Stops the containers (docker compose down) and pauses the mutagen sessions.
  status     Shows whether the container runs, in which mode (sync/no-sync), the state of each
             mutagen session and whether any of them has conflicts.
  resync     Terminates this project's mutagen sessions and creates them from scratch (a full fresh
             scan and staging) — the emergency path for a session that looks stuck.
  conflicts  Lists conflicts plus scan and write problems of every session of this project —
             including the ones a "watching" status hides. Exits with 1 if there is anything.
  verify     Flushes the sync and compares sha1 sums of host and container files, to check that the
             container really has what the host has — a "watching" status alone does not guarantee
             it. Without an argument it checks ${config.verifyPaths.join(' and ')}.

Flags:
  --no-sync   Run the container on a plain bind mount instead of a Docker volume plus mutagen
              (only with "up").
  --build     Rebuild the images before starting (only with "up").
  --all       Check the whole repository instead of the default paths (only with "verify").

Examples:
  ${name} up
  ${name} up --build
  ${name} up --no-sync
  ${name} stop
  ${name} status
  ${name} resync
  ${name} conflicts
  ${name} verify
  ${name} verify --all`;
}
//# sourceMappingURL=usage.js.map
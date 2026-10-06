import { existsSync, statSync } from 'node:fs';
import { green, red, yellow } from '../util/colors.js';
import { containerStatus, isBindMounted } from '../docker/container.js';
import { flushSession, sessionExists } from '../mutagen/session.js';
import { join } from 'node:path';
import { mainSession } from '../config/sessions.js';
import { UserError } from '../util/errors.js';
import { verifyPath } from '../verify/report.js';
function normalizePath(path) {
    const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
    return normalized === '' ? '.' : normalized;
}
function resolvePaths(config, requested, all) {
    if (requested !== undefined && all) {
        throw new UserError('Pass a path or --all, not both.');
    }
    if (all) {
        return ['.'];
    }
    return requested === undefined ? config.verifyPaths : [normalizePath(requested)];
}
function assertDirectories(config, paths) {
    for (const path of paths) {
        const absolute = path === '.' ? config.repoRoot : join(config.repoRoot, path);
        if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
            throw new UserError(`"${path}" is not a directory in the repository — verify compares directories, not single files.`);
        }
    }
}
/**
 * Pushes the sync through and compares sha1 sums of host and container files. A `watching` status
 * does not guarantee everything arrived — the watcher can miss a mass change of files, for instance
 * after switching branches.
 */
export function verify({ args, config, flags }) {
    const container = containerStatus(config);
    if (!container.exists || !container.running) {
        throw new UserError(`The container is not running — ${config.commandName} up.`);
    }
    if (isBindMounted(container)) {
        console.error(yellow('no-sync mode (bind mount) — the container sees the host files directly, there is nothing to verify.'));
        process.exitCode = 1;
        return;
    }
    const main = mainSession(config);
    if (!sessionExists(main.name)) {
        throw new UserError(`Mutagen session "${main.name}" does not exist — ${config.commandName} up.`);
    }
    const paths = resolvePaths(config, args[0], flags.all);
    assertDirectories(config, paths);
    console.log(`Flushing the sync (mutagen sync flush ${main.name})...`);
    flushSession(main.name);
    let differences = 0;
    for (const path of paths) {
        differences += verifyPath(config, path);
    }
    console.log('');
    if (differences === 0) {
        console.log(green('Summary: the container has the same files as the host.'));
        return;
    }
    console.log(red(`Summary: the container does not have the same files as the host (differences: ${differences}) — ${config.commandName} conflicts, and if there are none, ${config.commandName} resync.`));
    process.exitCode = 1;
}
//# sourceMappingURL=verify.js.map
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
/**
 * Returns the closest directory at or above `from` that contains `name`, or `undefined`.
 *
 * Existence, not type, is checked on purpose: in a git worktree `.git` is a file, not a directory,
 * and such a checkout has to work the same as a regular one.
 */
export function findUp(name, from) {
    let directory = resolve(from);
    for (;;) {
        if (existsSync(join(directory, name))) {
            return directory;
        }
        const parent = dirname(directory);
        if (parent === directory) {
            return undefined;
        }
        directory = parent;
    }
}
//# sourceMappingURL=findUp.js.map
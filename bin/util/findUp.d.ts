/**
 * Returns the closest directory at or above `from` that contains `name`, or `undefined`.
 *
 * Existence, not type, is checked on purpose: in a git worktree `.git` is a file, not a directory,
 * and such a checkout has to work the same as a regular one.
 */
export declare function findUp(name: string, from: string): string | undefined;

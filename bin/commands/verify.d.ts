import type { CommandContext } from '../types.js';
/**
 * Pushes the sync through and compares sha1 sums of host and container files. A `watching` status
 * does not guarantee everything arrived — the watcher can miss a mass change of files, for instance
 * after switching branches.
 */
export declare function verify({ args, config, flags }: CommandContext): void;

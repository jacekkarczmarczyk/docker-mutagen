import type { Config } from '../types.js';
/**
 * The main session's ignores, in the form used to compare host and container paths: without them
 * `verify` would report deliberately unsynchronized files as differences — including the two-way
 * paths, which the main ignore list contains and which have sessions of their own.
 */
export declare function isIgnored(config: Config, repoRelativePath: string): boolean;

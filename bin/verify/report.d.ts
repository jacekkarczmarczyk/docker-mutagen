import type { Config } from '../types.js';
/** Compares one path and returns the number of differences that count as a failure. */
export declare function verifyPath(config: Config, relativePath: string): number;

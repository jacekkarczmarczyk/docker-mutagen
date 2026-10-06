import type { Config } from '../types.js';
/**
 * The sha1 sums are computed in Node (fs + crypto) rather than through find/sha1sum, because this
 * runs on Windows, where those tools exist only for whoever has git bash in PATH.
 */
export declare function hostManifest(config: Config, relativePath: string): Map<string, string>;
export declare function containerManifest(config: Config, relativePath: string): Map<string, string>;

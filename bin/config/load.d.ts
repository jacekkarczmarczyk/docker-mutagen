import type { Config } from '../types.js';
export declare const CONFIG_FILE = "docker-mutagen.config.mjs";
/**
 * The config file and the repository root are looked up separately, both walking up from the
 * directory the command was run in.
 *
 * The config file sits next to the project's package.json, which is not necessarily the repository
 * root (one project keeps its package.json in a `web/` subdirectory), while the synchronization root
 * is always the directory holding `.git`. Deriving the root from `.git` instead of a configured
 * relative path is what makes the same config work regardless of the directory the command is
 * invoked from.
 */
export declare function loadConfig(cwd: string): Promise<Config>;

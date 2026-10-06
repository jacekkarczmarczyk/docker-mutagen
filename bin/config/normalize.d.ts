import type { Config, UserConfig } from '../types.js';
export interface ConfigLocation {
    configPath: string;
    repoRoot: string;
}
/**
 * Validates the user config, fills in the defaults and builds the session definitions.
 *
 * Every two-way path is added to the main session's ignores here, not in the project config: the two
 * sessions would otherwise fight over the same files, and that invariant is too easy to forget when
 * the lists are maintained by hand.
 */
export declare function normalizeConfig(userConfig: UserConfig, location: ConfigLocation): Config;

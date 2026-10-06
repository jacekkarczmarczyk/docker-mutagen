import type { BetaPermissions, Config, SessionDefinition } from '../types.js';
/**
 * The main one-way-safe session plus one two-way-safe session per two-way path.
 *
 * The main session comes first and the rest of the code relies on that order: the two-way sessions
 * can only be created once the main one has delivered the parent directories of their roots.
 */
export declare function buildSessions(config: Omit<Config, 'sessions'>, beta: Required<BetaPermissions>): SessionDefinition[];
export declare function mainSession(config: Config): SessionDefinition;
export declare function twoWaySessions(config: Config): SessionDefinition[];

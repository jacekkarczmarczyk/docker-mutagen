import type { CommandContext } from '../types.js';
/**
 * A full reset: terminate and recreate, which means a fresh scan and staging. A changed config no
 * longer needs this — `up` notices the drift through the config-hash label — so this is the emergency
 * path, for a session that looks stuck.
 */
export declare function resync({ config }: CommandContext): void;

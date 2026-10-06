import type { Config } from '../types.js';
/**
 * The two-way sessions are created only once the main session has delivered the parent directories
 * of their roots. Mutagen does not create a session root's parent, so with an empty volume (a fresh
 * project, or a renamed volume) their first write fails with "unable to walk to transition root
 * parent" while the session still goes to `watching` — quietly, with no file in the container.
 */
export declare function ensureSessions(config: Config): void;

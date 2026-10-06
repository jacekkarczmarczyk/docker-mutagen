import { ensureSessions } from '../mutagen/ensure.js';
import { terminateProjectSessions } from '../mutagen/session.js';
import type { CommandContext } from '../types.js';

/**
 * A full reset: terminate and recreate, which means a fresh scan and staging. A changed config no
 * longer needs this — `up` notices the drift through the config-hash label — so this is the emergency
 * path, for a session that looks stuck.
 */
export function resync ({ config }: CommandContext): void {
  console.log('Terminating this project\'s mutagen sessions...');
  terminateProjectSessions(config);
  console.log('Creating the mutagen sessions from scratch...');
  ensureSessions(config);
}

import { composeDown } from '../docker/compose.js';
import { pauseProjectSessions } from '../mutagen/session.js';
import type { CommandContext } from '../types.js';

/**
 * The sessions are paused, not terminated, so that the next `up` resumes immediately instead of
 * scanning everything again.
 */
export function stop ({ config }: CommandContext): void {
  pauseProjectSessions(config);
  composeDown(config);
}

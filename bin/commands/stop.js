import { composeDown } from '../docker/compose.js';
import { pauseProjectSessions } from '../mutagen/session.js';
/**
 * The sessions are paused, not terminated, so that the next `up` resumes immediately instead of
 * scanning everything again.
 */
export function stop({ config }) {
    pauseProjectSessions(config);
    composeDown(config);
}
//# sourceMappingURL=stop.js.map
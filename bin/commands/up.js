import { composeUp } from '../docker/compose.js';
import { ensureContainerOnlyDirs, setupPermissions } from '../docker/container.js';
import { ensureSessions } from '../mutagen/ensure.js';
import { pauseProjectSessions } from '../mutagen/session.js';
export function up({ config, flags }) {
    composeUp(config, flags.sync, flags.build);
    if (!flags.sync) {
        // Running sessions would keep writing into a container that now sees the host directly.
        pauseProjectSessions(config);
        return;
    }
    ensureSessions(config);
    ensureContainerOnlyDirs(config);
    setupPermissions(config);
}
//# sourceMappingURL=up.js.map
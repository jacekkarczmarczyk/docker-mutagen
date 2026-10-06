import { composeUp } from '../docker/compose.js';
import { containerStatus, ensureContainerOnlyDirs, isBindMounted, setupPermissions } from '../docker/container.js';
import { ensureSessions } from '../mutagen/ensure.js';
/**
 * Makes sure the container and (in sync mode) mutagen are running, without changing the mode the
 * container currently stands in: if someone deliberately started it with `--no-sync`, a dev server
 * calling this must not drag it back onto the volume plus mutagen.
 */
export function ensure({ config }) {
    const status = containerStatus(config);
    const useSync = !status.exists || !isBindMounted(status);
    if (!status.running) {
        composeUp(config, useSync, false);
        setupPermissions(config);
    }
    if (useSync) {
        ensureSessions(config);
        ensureContainerOnlyDirs(config);
    }
}
//# sourceMappingURL=ensure.js.map
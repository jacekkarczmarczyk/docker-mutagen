import { capture, run } from '../util/exec.js';
import { red } from '../util/colors.js';
import type { Config, ContainerStatus } from '../types.js';

export function containerStatus (config: Config): ContainerStatus {
  try {
    const format = '{{.State.Running}}|{{range .Mounts}}{{.Type}}{{end}}';
    const output = capture('docker', ['inspect', config.containerName, '--format', format]).trim();
    const [running, mountType] = output.split('|');

    return { exists: true, running: running === 'true', mountType: mountType ?? '' };
  } catch {
    return { exists: false, running: false, mountType: '' };
  }
}

export function isBindMounted (status: ContainerStatus): boolean {
  return status.mountType === 'bind';
}

export function containerPath (config: Config, path?: string): string {
  return path === undefined || path === '.' ? config.containerRoot : `${config.containerRoot}/${path}`;
}

/** Lists sha1 sums of every file under a path inside the container. */
export function containerDigests (config: Config, path: string): string {
  const target = containerPath(config, path);

  return capture('docker', ['exec', config.containerName, 'sh', '-c', `cd '${target}' && find . -type f -exec sha1sum {} +`]);
}

/**
 * Container-only directories never arrive from the host, because the main session ignores them, so
 * they are created here on every start. `mkdir -p` and `chown` are idempotent, so running this
 * against existing directories costs nothing.
 */
export function ensureContainerOnlyDirs (config: Config): void {
  if (config.containerOnlyDirs.length === 0) {
    return;
  }

  const paths = config.containerOnlyDirs.map(path => containerPath(config, path.replace(/^\//, '')));

  try {
    run('docker', ['exec', config.containerName, 'mkdir', '-p', ...paths]);
    run('docker', ['exec', config.containerName, 'chown', 'www-data:www-data', ...paths]);
  } catch {
    console.error(red(`Could not create ${config.containerOnlyDirs.join(', ')} in the container — the app may fail on a missing cache or log directory.`));
  }
}

/** Opens up the directories the app writes to at runtime. */
export function setupPermissions (config: Config): void {
  for (const path of config.chmodPaths) {
    try {
      run('docker', ['exec', config.containerName, 'chmod', '-R', '777', containerPath(config, path)]);
    } catch {
      // The directory may not be in the container yet if the sync has not delivered everything.
      // That is something to fix, but not a reason to fail the whole command with a stack trace.
      console.error(red(`Could not set permissions on "${path}" — check whether the container has that directory (${config.commandName} conflicts).`));
    }
  }
}

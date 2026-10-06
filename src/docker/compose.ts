import { run } from '../util/exec.js';
import type { Config } from '../types.js';

/**
 * In sync mode the sync override replaces the bind mount of the repository with a Docker volume, so
 * both files have to be passed — and `down` always passes both, so that it tears down whatever the
 * container was started with.
 */
function composeArgs (config: Config, sync: boolean): string[] {
  const args = ['compose', '-f', config.composeFile];

  if (sync) {
    args.push('-f', config.syncComposeFile);
  }

  return args;
}

export function composeUp (config: Config, sync: boolean, build: boolean): void {
  const args = [...composeArgs(config, sync), 'up', '-d'];

  if (build) {
    args.push('--build');
  }
  run('docker', args, { cwd: config.composeDir });
}

export function composeDown (config: Config): void {
  run('docker', [...composeArgs(config, true), 'down'], { cwd: config.composeDir });
}

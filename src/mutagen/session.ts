import { createHash } from 'node:crypto';
import { capture, run, succeeds, tryRun } from '../util/exec.js';
import type { Config, MutagenSession, SessionDefinition } from '../types.js';

const CONFIG_HASH_LABEL = 'config-hash';
const CONFIG_HASH_LENGTH = 12;

export function sessionExists (name: string): boolean {
  return succeeds('mutagen', ['sync', 'list', name]);
}

export function sessionInfo (name: string): MutagenSession {
  return JSON.parse(capture('mutagen', ['sync', 'list', name, '--template', '{{json (index . 0)}}'])) as MutagenSession;
}

/**
 * A session's configuration (mode, roots, ignore list) is frozen when it is created, so changing it
 * means recreating the session. The hash is kept as a label so that `up` notices the drift by itself
 * instead of waiting for someone to remember about `resync`.
 */
export function configHash (session: SessionDefinition): string {
  return createHash('sha1').update(session.createArgs.join(' ')).digest('hex').slice(0, CONFIG_HASH_LENGTH);
}

export function storedConfigHash (name: string): string {
  return sessionInfo(name).labels?.[CONFIG_HASH_LABEL] ?? '';
}

export function createSession (config: Config, session: SessionDefinition): void {
  run('mutagen', [
    'sync', 'create',
    '-n', session.name,
    '-l', config.projectLabel,
    '-l', `${CONFIG_HASH_LABEL}=${configHash(session)}`,
    ...session.createArgs,
  ]);
}

export function terminateSession (name: string): void {
  run('mutagen', ['sync', 'terminate', name]);
}

export function resumeSession (name: string): void {
  tryRun('mutagen', ['sync', 'resume', name]);
}

export function flushSession (name: string): void {
  run('mutagen', ['sync', 'flush', name]);
}

export function terminateProjectSessions (config: Config): void {
  // Nothing to terminate is not a failure.
  tryRun('mutagen', ['sync', 'terminate', '--label-selector', config.projectLabel]);
}

export function pauseProjectSessions (config: Config): void {
  // The sessions may not exist, or may disappear between the check and the pause.
  tryRun('mutagen', ['sync', 'pause', '--label-selector', config.projectLabel]);
}

export function existingSessions (config: Config): SessionDefinition[] {
  return config.sessions.filter(session => sessionExists(session.name));
}

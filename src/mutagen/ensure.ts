import { mainSession, twoWaySessions } from '../config/sessions.js';
import { configHash, createSession, resumeSession, sessionExists, sessionInfo, storedConfigHash, terminateSession } from './session.js';
import { green, red, yellow } from '../util/colors.js';
import { isWatching, sessionProblems } from './state.js';
import { sleep } from '../util/exec.js';
import { UserError } from '../util/errors.js';
import type { Config, SessionDefinition } from '../types.js';

const POLL_INTERVAL_MS = 2000;

function ensureSession (config: Config, session: SessionDefinition): void {
  if (!sessionExists(session.name)) {
    console.log(`Mutagen session "${session.name}" does not exist, creating it...`);
    createSession(config, session);
  } else if (storedConfigHash(session.name) !== configHash(session)) {
    console.log(yellow(`Configuration of session "${session.name}" changed, recreating it...`));
    terminateSession(session.name);
    createSession(config, session);
  } else {
    resumeSession(session.name);
  }
}

function waitUntilWatching (config: Config, sessions: SessionDefinition[]): void {
  if (sessions.length === 0) {
    return;
  }

  console.log('Waiting for mutagen to finish synchronizing...');
  const deadline = Date.now() + config.syncTimeoutMs;

  for (const session of sessions) {
    while (!isWatching(sessionInfo(session.name))) {
      if (Date.now() >= deadline) {
        throw new UserError(`Timeout: mutagen session "${session.name}" did not reach "watching" within ${config.syncTimeoutMs / 1000}s.`);
      }
      sleep(POLL_INTERVAL_MS);
    }
  }

  console.log(green('Mutagen sync ready.'));
}

function warnAboutProblems (config: Config): void {
  const broken = config.sessions.filter(session => sessionProblems(sessionInfo(session.name)).length > 0);

  if (broken.length > 0) {
    console.log(red(`Warning: despite reporting "watching", sessions ${broken.map(session => session.name).join(', ')} report problems — ${config.commandName} conflicts.`));
  }
}

/**
 * The two-way sessions are created only once the main session has delivered the parent directories
 * of their roots. Mutagen does not create a session root's parent, so with an empty volume (a fresh
 * project, or a renamed volume) their first write fails with "unable to walk to transition root
 * parent" while the session still goes to `watching` — quietly, with no file in the container.
 */
export function ensureSessions (config: Config): void {
  const main = mainSession(config);

  ensureSession(config, main);
  waitUntilWatching(config, [main]);

  const twoWay = twoWaySessions(config);

  for (const session of twoWay) {
    ensureSession(config, session);
  }
  waitUntilWatching(config, twoWay);
  warnAboutProblems(config);
}

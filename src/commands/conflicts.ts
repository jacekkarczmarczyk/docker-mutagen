import { bold, green, red, yellow } from '../util/colors.js';
import { conflicts, describeChanges, endpointProblems, excludedProblemCount, sessionProblems, sideChanged } from '../mutagen/state.js';
import { existingSessions, sessionInfo } from '../mutagen/session.js';
import { ONE_WAY_MODE } from '../types.js';
import { UserError } from '../util/errors.js';
import type { CommandContext, Config, MutagenEndpoint, MutagenSession, SessionDefinition } from '../types.js';

function printProblems (label: string, endpoint: MutagenEndpoint): void {
  const problems = endpointProblems(endpoint);
  const excluded = excludedProblemCount(endpoint);

  if (problems.length === 0) {
    return;
  }

  console.log(`  problems — ${label}:`);
  for (const problem of problems) {
    console.log(`    ${problem.path ?? '(session root)'} [${problem.kind}]: ${red(problem.error)}`);
  }
  if (excluded > 0) {
    console.log(`    ... and ${excluded} more (mutagen does not list them all)`);
  }
}

function printConflicts (config: Config, session: SessionDefinition, state: MutagenSession): void {
  for (const conflict of conflicts(state)) {
    console.log(`  ${bold(conflict.root ?? '.')}`);
    console.log(`    alpha (host):      ${describeChanges(conflict.alphaChanges)}`);
    console.log(`    beta (container):  ${describeChanges(conflict.betaChanges)}`);
    // In two-way-safe a conflict is resolved by picking a side, so the "delete it from the
    // container" hint would be misleading there — that copy is one of two equal versions of the
    // file, not an obstacle.
    if (session.mode === ONE_WAY_MODE && sideChanged(conflict.betaChanges)) {
      console.log(`    ${yellow('one-way-safe will not overwrite a file changed in the container — as long as that copy is there, the host version will not arrive.')}`);
      // The double slash before the container path keeps the command pasteable into git bash, which
      // would otherwise rewrite an absolute path into a Windows one.
      console.log(`    Delete it and flush the sync: docker exec ${config.containerName} rm "/${config.containerRoot}/${conflict.root ?? ''}" && mutagen sync flush ${session.name}`);
    }
  }
}

export function conflictsCommand ({ config }: CommandContext): void {
  const sessions = existingSessions(config);

  if (sessions.length === 0) {
    throw new UserError(`This project has no mutagen sessions — ${config.commandName} up.`);
  }

  let found = 0;

  for (const session of sessions) {
    const state = sessionInfo(session.name);
    const sessionConflicts = conflicts(state);
    const problems = sessionProblems(state);

    if (sessionConflicts.length === 0 && problems.length === 0) {
      continue;
    }

    found += sessionConflicts.length + problems.length;
    console.log(bold(`session "${session.name}" (${session.mode}) — conflicts: ${sessionConflicts.length}, problems: ${problems.length}`));
    printConflicts(config, session, state);
    printProblems('alpha (host)', state.alpha);
    printProblems('beta (container)', state.beta);
    if (problems.some(problem => problem.kind === 'transition')) {
      console.log(`  ${yellow('A write problem does not go away on its own, and the session still reports "watching" — retry it:')} mutagen sync flush ${session.name}`);
    }
    if (problems.some(problem => problem.kind === 'scan')) {
      console.log(`  ${yellow('A scan problem means mutagen could not read the file on that side — fix access to it, then')} mutagen sync flush ${session.name}`);
    }
  }

  if (found === 0) {
    console.log(green('No conflicts and no problems.'));

    return;
  }

  process.exitCode = 1;
}

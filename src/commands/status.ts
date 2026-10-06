import { bold, green, red, yellow } from '../util/colors.js';
import { conflicts, isWatching, sessionProblems } from '../mutagen/state.js';
import { containerStatus, isBindMounted } from '../docker/container.js';
import { sessionExists, sessionInfo } from '../mutagen/session.js';
import type { CommandContext, Config } from '../types.js';

interface SessionRow {
  name: string;
  status: string;
  watching: boolean;
  paused: boolean;
  cycles: number;
  conflicts: number;
  problems: number;
}

function sessionRows (config: Config): SessionRow[] {
  return config.sessions
    .filter(session => sessionExists(session.name))
    .map(session => {
      const state = sessionInfo(session.name);

      return {
        name: session.name,
        status: state.status,
        watching: isWatching(state),
        paused: state.paused ?? false,
        cycles: state.successfulCycles ?? 0,
        conflicts: conflicts(state).length,
        problems: sessionProblems(state).length,
      };
    });
}

function printContainer (config: Config): { exists: boolean; running: boolean; bind: boolean } {
  const status = containerStatus(config);
  const bind = isBindMounted(status);

  console.log(bold('Container:'));
  if (!status.exists) {
    console.log(`  ${red('does not exist')} — ${config.commandName} up`);
  } else if (!status.running) {
    console.log(`  ${red('stopped')} — ${config.commandName} up`);
  } else {
    console.log(`  ${green('running')}, mode: ${bind ? 'no-sync (bind mount)' : 'sync (volume + mutagen)'}`);
  }

  return { exists: status.exists, running: status.running, bind };
}

function printSessions (rows: SessionRow[]): void {
  console.log(bold('Mutagen:'));
  if (rows.length === 0) {
    console.log(`  ${yellow('no sessions')}`);

    return;
  }

  for (const row of rows) {
    const paint = row.watching ? green : row.paused ? yellow : red;
    const conflictText = row.conflicts > 0 ? red(`, conflicts: ${row.conflicts}`) : '';
    // Problems are shown next to conflicts, because a session with a failed write still reports
    // "watching" — without this line it looks completely healthy while having delivered nothing.
    const problemText = row.problems > 0 ? red(`, problems: ${row.problems}`) : '';

    console.log(`  session "${row.name}": ${paint(row.status)}${row.paused ? yellow(' [paused]') : ''}, successful cycles: ${row.cycles}${conflictText}${problemText}`);
  }
}

export function status ({ config }: CommandContext): void {
  const container = printContainer(config);
  const rows = sessionRows(config);
  const broken = rows.filter(row => row.conflicts > 0 || row.problems > 0);

  printSessions(rows);
  console.log('');

  if (!container.exists || !container.running) {
    console.log(red(`Summary: the container is not running — ${config.commandName} up.`));
  } else if (container.bind) {
    console.log(yellow('Summary: no-sync mode (bind mount) — mutagen is deliberately inactive.'));
  } else if (rows.length !== config.sessions.length) {
    console.log(yellow(`Summary: sync mode, but some sessions are missing — ${config.commandName} up will create them.`));
  } else if (broken.length > 0) {
    console.log(yellow(`Summary: sync mode, but there are conflicts or problems (${broken.map(row => row.name).join(', ')}) — ${config.commandName} conflicts.`));
  } else if (rows.every(row => row.watching)) {
    console.log(green('Summary: sync mode, mutagen is working — all good.'));
  } else if (rows.some(row => row.paused)) {
    console.log(yellow(`Summary: sync mode, but mutagen is paused — ${config.commandName} up to resume it.`));
  } else {
    console.log(red(`Summary: sync mode, but mutagen is not synchronizing properly — check "mutagen sync list --label-selector ${config.projectLabel}".`));
  }
}

import { conflictsCommand } from './commands/conflicts.js';
import { ensure } from './commands/ensure.js';
import { loadConfig } from './config/load.js';
import { parseArgs } from './util/args.js';
import { resync } from './commands/resync.js';
import { status } from './commands/status.js';
import { stop } from './commands/stop.js';
import { up } from './commands/up.js';
import { usage } from './commands/usage.js';
import { UserError } from './util/errors.js';
import { verify } from './commands/verify.js';
const COMMANDS = {
    up,
    ensure,
    stop,
    status,
    resync,
    conflicts: conflictsCommand,
    verify,
};
/**
 * Runs one command: loads the project config found above the current directory, then dispatches.
 * Throws `UserError` for anything the caller can fix; the CLI turns that into a message and exit 1.
 */
export async function run(argv, cwd = process.cwd()) {
    const { command, flags, help, positionals } = parseArgs(argv);
    const config = await loadConfig(cwd);
    if (help || command === undefined) {
        console.error(usage(config));
        process.exitCode = command === undefined && !help ? 1 : 0;
        return;
    }
    const handler = COMMANDS[command];
    if (handler === undefined) {
        console.error(usage(config));
        throw new UserError(`Unknown command "${command}".`);
    }
    handler({ config, flags, args: positionals });
}
//# sourceMappingURL=run.js.map
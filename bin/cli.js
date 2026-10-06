#!/usr/bin/env node
import { red } from './util/colors.js';
import { run } from './run.js';
import { UserError } from './util/errors.js';
/**
 * A failed child process has already printed whatever it had to say, so a Node stack trace on top of
 * it is noise. A missing binary is worth naming, because that is the one failure whose cause is not
 * visible in the child's own output.
 */
function describeSpawnFailure(error) {
    if (error.code === 'ENOENT') {
        return `"${error.path ?? 'command'}" not found in PATH.`;
    }
    return typeof error.status === 'number' ? `Command failed with exit code ${error.status}.` : undefined;
}
try {
    await run(process.argv.slice(2));
}
catch (error) {
    if (error instanceof UserError) {
        console.error(red(error.message));
        process.exit(1);
    }
    const message = describeSpawnFailure(error);
    if (message === undefined) {
        throw error;
    }
    console.error(red(message));
    process.exit(1);
}
//# sourceMappingURL=cli.js.map
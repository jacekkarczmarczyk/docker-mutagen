import { UserError } from './errors.js';
/**
 * Hand-rolled parsing instead of a dependency: the whole surface is one command plus three boolean
 * flags. It also lets an unknown flag fail loudly — a typo in `--no-sync` silently starting the
 * container on a bind mount is exactly the mistake that is hard to notice afterwards.
 */
export function parseArgs(argv) {
    const positionals = [];
    const flags = { sync: true, build: false, all: false };
    let help = false;
    for (const argument of argv) {
        switch (argument) {
            case '--no-sync':
                flags.sync = false;
                break;
            case '--build':
                flags.build = true;
                break;
            case '--all':
                flags.all = true;
                break;
            case '--help':
            case '-h':
                help = true;
                break;
            default:
                if (argument.startsWith('-')) {
                    throw new UserError(`Unknown flag "${argument}".`);
                }
                positionals.push(argument);
        }
    }
    return { command: positionals[0], positionals: positionals.slice(1), flags, help };
}
//# sourceMappingURL=args.js.map
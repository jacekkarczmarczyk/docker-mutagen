import type { Flags } from '../types.js';
export interface ParsedArgs {
    command: string | undefined;
    positionals: string[];
    flags: Flags;
    help: boolean;
}
/**
 * Hand-rolled parsing instead of a dependency: the whole surface is one command plus three boolean
 * flags. It also lets an unknown flag fail loudly — a typo in `--no-sync` silently starting the
 * container on a bind mount is exactly the mistake that is hard to notice afterwards.
 */
export declare function parseArgs(argv: string[]): ParsedArgs;

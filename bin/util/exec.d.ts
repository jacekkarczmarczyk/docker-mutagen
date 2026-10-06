export interface RunOptions {
    cwd?: string;
}
/** Runs a command with its output passed through to the terminal; throws when it fails. */
export declare function run(file: string, args: string[], options?: RunOptions): void;
/** Runs a command and returns its stdout; stderr is swallowed, failure throws. */
export declare function capture(file: string, args: string[], options?: RunOptions): string;
/** Runs a command discarding its output and tells whether it succeeded. */
export declare function succeeds(file: string, args: string[], options?: RunOptions): boolean;
/** Runs a command discarding its output and ignoring a failure. */
export declare function tryRun(file: string, args: string[], options?: RunOptions): void;
/**
 * Blocking sleep — the whole CLI is synchronous (execFileSync), so there is nothing to await on and
 * a promise-based sleep would only hide that.
 */
export declare function sleep(ms: number): void;

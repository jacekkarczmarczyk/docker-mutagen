import { execFileSync } from 'node:child_process';
/** Big enough for a sha1 manifest of a whole repository; execFileSync defaults to 1 MB. */
const DEFAULT_MAX_BUFFER = 256 * 1024 * 1024;
/** Runs a command with its output passed through to the terminal; throws when it fails. */
export function run(file, args, options = {}) {
    execFileSync(file, args, { ...options, stdio: 'inherit' });
}
/** Runs a command and returns its stdout; stderr is swallowed, failure throws. */
export function capture(file, args, options = {}) {
    return execFileSync(file, args, {
        ...options,
        encoding: 'utf-8',
        maxBuffer: DEFAULT_MAX_BUFFER,
        stdio: ['ignore', 'pipe', 'ignore'],
    });
}
/** Runs a command discarding its output and tells whether it succeeded. */
export function succeeds(file, args, options = {}) {
    try {
        execFileSync(file, args, { ...options, stdio: 'ignore' });
        return true;
    }
    catch {
        return false;
    }
}
/** Runs a command discarding its output and ignoring a failure. */
export function tryRun(file, args, options = {}) {
    succeeds(file, args, options);
}
/**
 * Blocking sleep — the whole CLI is synchronous (execFileSync), so there is nothing to await on and
 * a promise-based sleep would only hide that.
 */
export function sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
//# sourceMappingURL=exec.js.map
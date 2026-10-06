/**
 * An error caused by the caller or by the state of the environment, not by a bug in the code:
 * the CLI prints just the message and exits with code 1, without a stack trace.
 */
export declare class UserError extends Error {
    readonly name: string;
}
/** An error in the project's config file. */
export declare class ConfigError extends UserError {
    readonly name: string;
}

/**
 * An error caused by the caller or by the state of the environment, not by a bug in the code:
 * the CLI prints just the message and exits with code 1, without a stack trace.
 */
export class UserError extends Error {
    name = 'UserError';
}
/** An error in the project's config file. */
export class ConfigError extends UserError {
    name = 'ConfigError';
}
//# sourceMappingURL=errors.js.map
/**
 * Runs one command: loads the project config found above the current directory, then dispatches.
 * Throws `UserError` for anything the caller can fix; the CLI turns that into a message and exit 1.
 */
export declare function run(argv: string[], cwd?: string): Promise<void>;

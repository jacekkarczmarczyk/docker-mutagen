import type { CommandContext } from '../types.js';
/**
 * Makes sure the container and (in sync mode) mutagen are running, without changing the mode the
 * container currently stands in: if someone deliberately started it with `--no-sync`, a dev server
 * calling this must not drag it back onto the volume plus mutagen.
 */
export declare function ensure({ config }: CommandContext): void;

import type { CommandContext } from '../types.js';
/**
 * The sessions are paused, not terminated, so that the next `up` resumes immediately instead of
 * scanning everything again.
 */
export declare function stop({ config }: CommandContext): void;

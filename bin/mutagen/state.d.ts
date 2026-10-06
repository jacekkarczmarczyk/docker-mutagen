import type { MutagenChange, MutagenConflict, MutagenEndpoint, MutagenSession } from '../types.js';
export type ProblemKind = 'scan' | 'transition';
export interface Problem {
    path?: string;
    error: string;
    kind: ProblemKind;
}
/** The status is a value such as `watching`, `scanning` or `staging-beta`. */
export declare function isWatching(session: MutagenSession): boolean;
export declare function conflicts(session: MutagenSession): MutagenConflict[];
/**
 * Mutagen keeps problems under an endpoint (alpha/beta), not at session level, and in two kinds:
 * scan problems are a failure to read the tree, transition problems a failure to apply a change,
 * e.g. "unable to walk to transition root parent" when the parent directory of a session root is
 * missing. A session with such a problem still reports `watching`, so without listing them it looks
 * perfectly healthy while delivering nothing.
 */
export declare function endpointProblems(endpoint: MutagenEndpoint): Problem[];
export declare function excludedProblemCount(endpoint: MutagenEndpoint): number;
export declare function sessionProblems(session: MutagenSession): Problem[];
export declare function describeChanges(changes: MutagenChange[] | undefined): string;
export declare function sideChanged(changes: MutagenChange[] | undefined): boolean;

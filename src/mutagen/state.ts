import type { MutagenChange, MutagenConflict, MutagenEndpoint, MutagenEntry, MutagenSession } from '../types.js';

const DIGEST_LENGTH = 12;

export type ProblemKind = 'scan' | 'transition';

export interface Problem {
  path?: string;
  error: string;
  kind: ProblemKind;
}

/** The status is a value such as `watching`, `scanning` or `staging-beta`. */
export function isWatching (session: MutagenSession): boolean {
  return session.status.toLowerCase().includes('watching');
}

export function conflicts (session: MutagenSession): MutagenConflict[] {
  return session.conflicts ?? [];
}

/**
 * Mutagen keeps problems under an endpoint (alpha/beta), not at session level, and in two kinds:
 * scan problems are a failure to read the tree, transition problems a failure to apply a change,
 * e.g. "unable to walk to transition root parent" when the parent directory of a session root is
 * missing. A session with such a problem still reports `watching`, so without listing them it looks
 * perfectly healthy while delivering nothing.
 */
export function endpointProblems (endpoint: MutagenEndpoint): Problem[] {
  return [
    ...(endpoint.scanProblems ?? []).map(problem => ({ ...problem, kind: 'scan' as const })),
    ...(endpoint.transitionProblems ?? []).map(problem => ({ ...problem, kind: 'transition' as const })),
  ];
}

export function excludedProblemCount (endpoint: MutagenEndpoint): number {
  return (endpoint.excludedScanProblems ?? 0) + (endpoint.excludedTransitionProblems ?? 0);
}

export function sessionProblems (session: MutagenSession): Problem[] {
  return [...endpointProblems(session.alpha), ...endpointProblems(session.beta)];
}

function shortDigest (entry: MutagenEntry | null | undefined): string {
  if (entry === null || entry === undefined) {
    return 'none';
  }
  if (entry.kind !== 'file' || entry.digest === undefined) {
    return entry.kind ?? 'none';
  }

  return entry.digest.slice(0, DIGEST_LENGTH);
}

export function describeChanges (changes: MutagenChange[] | undefined): string {
  if (changes === undefined || changes.length === 0) {
    return 'unchanged';
  }

  return changes.map(change => {
    const from = shortDigest(change.old);
    const to = shortDigest(change.new);

    return from === to ? `unchanged (${from})` : `${from} -> ${to}`;
  }).join(', ');
}

export function sideChanged (changes: MutagenChange[] | undefined): boolean {
  return (changes ?? []).some(change => shortDigest(change.old) !== shortDigest(change.new));
}

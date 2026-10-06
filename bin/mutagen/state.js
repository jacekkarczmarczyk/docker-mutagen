const DIGEST_LENGTH = 12;
/** The status is a value such as `watching`, `scanning` or `staging-beta`. */
export function isWatching(session) {
    return session.status.toLowerCase().includes('watching');
}
export function conflicts(session) {
    return session.conflicts ?? [];
}
/**
 * Mutagen keeps problems under an endpoint (alpha/beta), not at session level, and in two kinds:
 * scan problems are a failure to read the tree, transition problems a failure to apply a change,
 * e.g. "unable to walk to transition root parent" when the parent directory of a session root is
 * missing. A session with such a problem still reports `watching`, so without listing them it looks
 * perfectly healthy while delivering nothing.
 */
export function endpointProblems(endpoint) {
    return [
        ...(endpoint.scanProblems ?? []).map(problem => ({ ...problem, kind: 'scan' })),
        ...(endpoint.transitionProblems ?? []).map(problem => ({ ...problem, kind: 'transition' })),
    ];
}
export function excludedProblemCount(endpoint) {
    return (endpoint.excludedScanProblems ?? 0) + (endpoint.excludedTransitionProblems ?? 0);
}
export function sessionProblems(session) {
    return [...endpointProblems(session.alpha), ...endpointProblems(session.beta)];
}
function shortDigest(entry) {
    if (entry === null || entry === undefined) {
        return 'none';
    }
    if (entry.kind !== 'file' || entry.digest === undefined) {
        return entry.kind ?? 'none';
    }
    return entry.digest.slice(0, DIGEST_LENGTH);
}
export function describeChanges(changes) {
    if (changes === undefined || changes.length === 0) {
        return 'unchanged';
    }
    return changes.map(change => {
        const from = shortDigest(change.old);
        const to = shortDigest(change.new);
        return from === to ? `unchanged (${from})` : `${from} -> ${to}`;
    }).join(', ');
}
export function sideChanged(changes) {
    return (changes ?? []).some(change => shortDigest(change.old) !== shortDigest(change.new));
}
//# sourceMappingURL=state.js.map
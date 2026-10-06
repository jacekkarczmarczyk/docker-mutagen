import type { Config } from '../types.js';

/** The main session is created with `--ignore-vcs`, so `verify` has to skip the same directories. */
const VCS_IGNORES = ['.git', '.svn', '.hg', '_darcs'];

/** A mutagen ignore may be anchored at the root with a leading slash; comparing needs it stripped. */
function withoutAnchor (ignore: string): string {
  return ignore.replace(/^\//, '');
}

/**
 * The main session's ignores, in the form used to compare host and container paths: without them
 * `verify` would report deliberately unsynchronized files as differences — including the two-way
 * paths, which the main ignore list contains and which have sessions of their own.
 */
export function isIgnored (config: Config, repoRelativePath: string): boolean {
  const segments = repoRelativePath.split('/');

  if (config.ignoreVcs && segments.some(segment => VCS_IGNORES.includes(segment))) {
    return true;
  }

  return config.mainIgnores.some(ignore => {
    // An ignore anchored at the root ("/vendor") or a multi-segment one ("cache/core") is compared
    // against the whole path; a bare name matches a segment at any depth, same as in mutagen.
    if (ignore.includes('/')) {
      const path = withoutAnchor(ignore);

      return repoRelativePath === path || repoRelativePath.startsWith(`${path}/`);
    }

    return segments.includes(ignore);
  });
}

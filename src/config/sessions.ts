import { ONE_WAY_MODE, TWO_WAY_MODE } from '../types.js';
import type { BetaPermissions, Config, SessionDefinition } from '../types.js';

/** Mutagen takes roots with forward slashes, Windows drive letters included. */
function alphaRoot (repoRoot: string, path?: string): string {
  const root = repoRoot.replace(/\\/g, '/');

  return path === undefined ? root : `${root}/${path}`;
}

function betaRoot (config: Omit<Config, 'sessions'>, path?: string): string {
  const root = `docker://${config.containerName}${config.containerRoot}`;

  return path === undefined ? root : `${root}/${path}`;
}

function permissionArgs (beta: Required<BetaPermissions>): string[] {
  return [
    '--permissions-mode=manual',
    `--default-owner-beta=${beta.owner}`,
    `--default-group-beta=${beta.group}`,
    `--default-file-mode-beta=${beta.fileMode}`,
    `--default-directory-mode-beta=${beta.directoryMode}`,
  ];
}

/**
 * The main one-way-safe session plus one two-way-safe session per two-way path.
 *
 * The main session comes first and the rest of the code relies on that order: the two-way sessions
 * can only be created once the main one has delivered the parent directories of their roots.
 */
export function buildSessions (config: Omit<Config, 'sessions'>, beta: Required<BetaPermissions>): SessionDefinition[] {
  const permissions = permissionArgs(beta);

  return [
    {
      name: config.sessionName,
      mode: ONE_WAY_MODE,
      createArgs: [
        '-m', ONE_WAY_MODE,
        ...(config.ignoreVcs ? ['--ignore-vcs'] : []),
        ...config.mainIgnores.flatMap(ignore => ['-i', ignore]),
        ...permissions,
        alphaRoot(config.repoRoot), betaRoot(config),
      ],
    },
    ...config.twoWayPaths.map(({ name, path }) => ({
      name: `${config.sessionName}-${name}`,
      mode: TWO_WAY_MODE,
      createArgs: [
        '-m', TWO_WAY_MODE,
        ...permissions,
        alphaRoot(config.repoRoot, path), betaRoot(config, path),
      ],
    })),
  ];
}

export function mainSession (config: Config): SessionDefinition {
  const [session] = config.sessions;

  if (session === undefined) {
    throw new Error('No sessions were built, which should be impossible.');
  }

  return session;
}

export function twoWaySessions (config: Config): SessionDefinition[] {
  return config.sessions.slice(1);
}

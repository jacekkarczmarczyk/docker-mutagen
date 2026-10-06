export const ONE_WAY_MODE = 'one-way-safe' as const;
export const TWO_WAY_MODE = 'two-way-safe' as const;

export type SyncMode = typeof ONE_WAY_MODE | typeof TWO_WAY_MODE;

/**
 * A path the app writes inside the container and which has to come back to the host. It gets its own
 * two-way-safe mutagen session, because in mutagen the synchronization mode is a per-session setting,
 * not a per-path one. A session root may be either a directory or a single file.
 */
export interface TwoWayPath {
  /** Session name suffix (`<sessionName>-<name>`), so it must be unique and without spaces. */
  name: string;
  /** Path relative to the repository root, with forward slashes. */
  path: string;
}

export interface BetaPermissions {
  /** Owner of the files created in the container, in mutagen syntax (e.g. `id:33` = www-data). */
  owner?: string;
  group?: string;
  fileMode?: string;
  directoryMode?: string;
}

/** Configuration read from the project's `docker-mutagen.config.mjs`. */
export interface UserConfig {
  /** Project name; becomes the `project=<projectName>` label of every session. */
  projectName: string;
  containerName: string;
  /** Name of the main session; defaults to `<projectName>-sync`. */
  sessionName?: string;
  /** The repository root inside the container; defaults to `/var/www/html`. */
  containerRoot?: string;
  /** Directory holding the compose files, relative to the repository root; defaults to `docker`. */
  composeDir?: string;
  composeFile?: string;
  syncComposeFile?: string;
  /** How the project invokes this command — used in messages only (e.g. `pnpm run docker`). */
  commandName?: string;
  /** Main session ignores, git syntax; two-way paths and container-only dirs are added on top. */
  ignores?: string[];
  twoWayPaths?: TwoWayPath[];
  /**
   * Directories the app writes only inside the container and which are not worth dragging onto the
   * host. They are ignored by the main session, so nothing creates them in the container — with a
   * Docker volume the root's contents are created by mutagen itself and files from the repository
   * never reach them. That is why `up` creates them in the container (mkdir -p + chown).
   */
  containerOnlyDirs?: string[];
  /** Paths `up` chmods to 777 in the container (directories written to by Apache). */
  chmodPaths?: string[];
  /** Default scope of `verify`; defaults to the whole repository root. */
  verifyPaths?: string[];
  verifyListLimit?: number;
  syncTimeoutMs?: number;
  beta?: BetaPermissions;
  /** Whether the main session skips version control directories; defaults to true. */
  ignoreVcs?: boolean;
}

export interface SessionDefinition {
  name: string;
  mode: SyncMode;
  createArgs: string[];
}

/** Configuration after validation and filling in the defaults. */
export interface Config {
  projectName: string;
  projectLabel: string;
  sessionName: string;
  containerName: string;
  containerRoot: string;
  /** Absolute path of the repository root (the directory holding `.git`). */
  repoRoot: string;
  /** Absolute path of the config file that was loaded. */
  configPath: string;
  /** Absolute path of the directory holding the compose files. */
  composeDir: string;
  composeFile: string;
  syncComposeFile: string;
  commandName: string;
  mainIgnores: string[];
  twoWayPaths: TwoWayPath[];
  containerOnlyDirs: string[];
  chmodPaths: string[];
  verifyPaths: string[];
  verifyListLimit: number;
  syncTimeoutMs: number;
  ignoreVcs: boolean;
  sessions: SessionDefinition[];
}

export interface MutagenProblem {
  path?: string;
  error: string;
}

export interface MutagenEndpoint {
  scanProblems?: MutagenProblem[];
  transitionProblems?: MutagenProblem[];
  excludedScanProblems?: number;
  excludedTransitionProblems?: number;
}

export interface MutagenEntry {
  kind?: string;
  digest?: string;
}

export interface MutagenChange {
  old?: MutagenEntry | null;
  new?: MutagenEntry | null;
}

export interface MutagenConflict {
  root?: string;
  alphaChanges?: MutagenChange[];
  betaChanges?: MutagenChange[];
}

/**
 * A session as returned by `mutagen sync list --template '{{json .}}'`: keys start with a lowercase
 * letter, unlike in Go templates, and `conflicts` and the problem lists show up only when non-empty.
 */
export interface MutagenSession {
  status: string;
  paused?: boolean;
  successfulCycles?: number;
  conflicts?: MutagenConflict[];
  alpha: MutagenEndpoint;
  beta: MutagenEndpoint;
  labels?: Record<string, string>;
}

export interface ContainerStatus {
  exists: boolean;
  running: boolean;
  /** Mount type of the root: `bind` means no-sync mode, `volume` means sync mode. */
  mountType: string;
}

export interface Flags {
  /** `false` only when `--no-sync` was passed. */
  sync: boolean;
  build: boolean;
  all: boolean;
}

export interface CommandContext {
  config: Config;
  flags: Flags;
  /** Positional arguments following the command name. */
  args: string[];
}

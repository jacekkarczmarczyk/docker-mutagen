import { isAbsolute, join } from 'node:path';
import { ConfigError } from '../util/errors.js';
import { buildSessions } from './sessions.js';
const DEFAULT_CONTAINER_ROOT = '/var/www/html';
const DEFAULT_COMPOSE_DIRECTORY = 'docker';
const DEFAULT_COMPOSE_FILE = 'docker-compose.yml';
const DEFAULT_SYNC_COMPOSE_FILE = 'docker-compose.sync.yml';
const DEFAULT_COMMAND_NAME = 'docker-mutagen';
const DEFAULT_VERIFY_LIST_LIMIT = 20;
const DEFAULT_SYNC_TIMEOUT_MS = 5 * 60 * 1000;
// permissions-mode manual + www-data (id 33), so that files created in the container belong to the
// user Apache runs as.
const DEFAULT_BETA = {
    owner: 'id:33',
    group: 'id:33',
    fileMode: '0644',
    directoryMode: '0755',
};
function optionalString(value, key) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string' || value === '') {
        throw new ConfigError(`"${key}" must be a non-empty string.`);
    }
    return value;
}
function requiredString(value, key) {
    const string = optionalString(value, key);
    if (string === undefined) {
        throw new ConfigError(`"${key}" is required.`);
    }
    return string;
}
function stringArray(value, key) {
    if (value === undefined) {
        return [];
    }
    if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || item === '')) {
        throw new ConfigError(`"${key}" must be an array of non-empty strings.`);
    }
    return value;
}
function positiveNumber(value, key, fallback) {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        throw new ConfigError(`"${key}" must be a positive number.`);
    }
    return value;
}
function boolean(value, key, fallback) {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value !== 'boolean') {
        throw new ConfigError(`"${key}" must be a boolean.`);
    }
    return value;
}
/** Mutagen takes session roots with forward slashes on every platform. */
function toPosix(path) {
    return path.replace(/\\/g, '/').replace(/\/+$/, '');
}
function twoWayPaths(value) {
    if (value === undefined) {
        return [];
    }
    if (!Array.isArray(value)) {
        throw new ConfigError('"twoWayPaths" must be an array.');
    }
    const paths = value.map((entry, index) => {
        const key = `twoWayPaths[${index}]`;
        if (entry === null || typeof entry !== 'object') {
            throw new ConfigError(`"${key}" must be an object with "name" and "path".`);
        }
        const { name, path } = entry;
        const checkedPath = requiredString(path, `${key}.path`);
        if (isAbsolute(checkedPath) || checkedPath.startsWith('/')) {
            throw new ConfigError(`"${key}.path" must be relative to the repository root, got "${checkedPath}".`);
        }
        return { name: requiredString(name, `${key}.name`), path: toPosix(checkedPath) };
    });
    const names = new Set(paths.map(path => path.name));
    if (names.size !== paths.length) {
        throw new ConfigError('"twoWayPaths" names must be unique — each one becomes a session name suffix.');
    }
    return paths;
}
function betaPermissions(value) {
    if (value === undefined) {
        return DEFAULT_BETA;
    }
    if (value === null || typeof value !== 'object') {
        throw new ConfigError('"beta" must be an object.');
    }
    const beta = value;
    return {
        owner: optionalString(beta.owner, 'beta.owner') ?? DEFAULT_BETA.owner,
        group: optionalString(beta.group, 'beta.group') ?? DEFAULT_BETA.group,
        fileMode: optionalString(beta.fileMode, 'beta.fileMode') ?? DEFAULT_BETA.fileMode,
        directoryMode: optionalString(beta.directoryMode, 'beta.directoryMode') ?? DEFAULT_BETA.directoryMode,
    };
}
/**
 * Validates the user config, fills in the defaults and builds the session definitions.
 *
 * Every two-way path is added to the main session's ignores here, not in the project config: the two
 * sessions would otherwise fight over the same files, and that invariant is too easy to forget when
 * the lists are maintained by hand.
 */
export function normalizeConfig(userConfig, location) {
    const projectName = requiredString(userConfig.projectName, 'projectName');
    const containerRoot = optionalString(userConfig.containerRoot, 'containerRoot') ?? DEFAULT_CONTAINER_ROOT;
    if (!containerRoot.startsWith('/')) {
        throw new ConfigError(`"containerRoot" must be an absolute path inside the container, got "${containerRoot}".`);
    }
    const paths = twoWayPaths(userConfig.twoWayPaths);
    const containerOnlyDirs = stringArray(userConfig.containerOnlyDirs, 'containerOnlyDirs');
    const verifyPaths = stringArray(userConfig.verifyPaths, 'verifyPaths');
    const config = {
        projectName,
        projectLabel: `project=${projectName}`,
        sessionName: optionalString(userConfig.sessionName, 'sessionName') ?? `${projectName}-sync`,
        containerName: requiredString(userConfig.containerName, 'containerName'),
        containerRoot: containerRoot.replace(/\/+$/, ''),
        repoRoot: location.repoRoot,
        configPath: location.configPath,
        composeDir: join(location.repoRoot, optionalString(userConfig.composeDir, 'composeDir') ?? DEFAULT_COMPOSE_DIRECTORY),
        composeFile: optionalString(userConfig.composeFile, 'composeFile') ?? DEFAULT_COMPOSE_FILE,
        syncComposeFile: optionalString(userConfig.syncComposeFile, 'syncComposeFile') ?? DEFAULT_SYNC_COMPOSE_FILE,
        commandName: optionalString(userConfig.commandName, 'commandName') ?? DEFAULT_COMMAND_NAME,
        mainIgnores: [
            ...stringArray(userConfig.ignores, 'ignores'),
            ...containerOnlyDirs,
            ...paths.map(path => path.path),
        ],
        twoWayPaths: paths,
        containerOnlyDirs,
        chmodPaths: stringArray(userConfig.chmodPaths, 'chmodPaths'),
        verifyPaths: verifyPaths.length > 0 ? verifyPaths : ['.'],
        verifyListLimit: positiveNumber(userConfig.verifyListLimit, 'verifyListLimit', DEFAULT_VERIFY_LIST_LIMIT),
        syncTimeoutMs: positiveNumber(userConfig.syncTimeoutMs, 'syncTimeoutMs', DEFAULT_SYNC_TIMEOUT_MS),
        ignoreVcs: boolean(userConfig.ignoreVcs, 'ignoreVcs', true),
    };
    return { ...config, sessions: buildSessions(config, betaPermissions(userConfig.beta)) };
}
//# sourceMappingURL=normalize.js.map
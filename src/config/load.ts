import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { ConfigError } from '../util/errors.js';
import { findUp } from '../util/findUp.js';
import { normalizeConfig } from './normalize.js';
import type { Config, UserConfig } from '../types.js';

export const CONFIG_FILE = 'docker-mutagen.config.mjs';
const GIT_DIRECTORY = '.git';

/**
 * The config file and the repository root are looked up separately, both walking up from the
 * directory the command was run in.
 *
 * The config file sits next to the project's package.json, which is not necessarily the repository
 * root (one project keeps its package.json in a `web/` subdirectory), while the synchronization root
 * is always the directory holding `.git`. Deriving the root from `.git` instead of a configured
 * relative path is what makes the same config work regardless of the directory the command is
 * invoked from.
 */
export async function loadConfig (cwd: string): Promise<Config> {
  const configDirectory = findUp(CONFIG_FILE, cwd);

  if (configDirectory === undefined) {
    throw new ConfigError(`No "${CONFIG_FILE}" found in "${cwd}" or any directory above it.`);
  }

  const repoRoot = findUp(GIT_DIRECTORY, configDirectory);

  if (repoRoot === undefined) {
    throw new ConfigError(`No "${GIT_DIRECTORY}" found in "${configDirectory}" or any directory above it, so the repository root cannot be determined.`);
  }

  const configPath = join(configDirectory, CONFIG_FILE);
  const module = await import(pathToFileURL(configPath).href) as { default?: unknown };

  if (module.default === undefined || module.default === null || typeof module.default !== 'object') {
    throw new ConfigError(`"${configPath}" must have a default export with the configuration object.`);
  }

  return normalizeConfig(module.default as UserConfig, { configPath, repoRoot });
}

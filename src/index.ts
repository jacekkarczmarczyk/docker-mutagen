import type { UserConfig } from './types.js';

export { run } from './run.js';
export { loadConfig, CONFIG_FILE } from './config/load.js';
export { UserError, ConfigError } from './util/errors.js';
export type { BetaPermissions, Config, SessionDefinition, SyncMode, TwoWayPath, UserConfig } from './types.js';

/** Identity helper that gives a project's `docker-mutagen.config.mjs` type checking and completion. */
export function defineConfig (config: UserConfig): UserConfig {
  return config;
}

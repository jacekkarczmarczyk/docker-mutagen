export { run } from './run.js';
export { loadConfig, CONFIG_FILE } from './config/load.js';
export { UserError, ConfigError } from './util/errors.js';
/** Identity helper that gives a project's `docker-mutagen.config.mjs` type checking and completion. */
export function defineConfig(config) {
    return config;
}
//# sourceMappingURL=index.js.map
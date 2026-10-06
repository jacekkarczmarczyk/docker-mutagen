import type { Config, ContainerStatus } from '../types.js';
export declare function containerStatus(config: Config): ContainerStatus;
export declare function isBindMounted(status: ContainerStatus): boolean;
export declare function containerPath(config: Config, path?: string): string;
/** Lists sha1 sums of every file under a path inside the container. */
export declare function containerDigests(config: Config, path: string): string;
/**
 * Container-only directories never arrive from the host, because the main session ignores them, so
 * they are created here on every start. `mkdir -p` and `chown` are idempotent, so running this
 * against existing directories costs nothing.
 */
export declare function ensureContainerOnlyDirs(config: Config): void;
/** Opens up the directories the app writes to at runtime. */
export declare function setupPermissions(config: Config): void;

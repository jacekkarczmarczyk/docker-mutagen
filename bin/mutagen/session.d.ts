import type { Config, MutagenSession, SessionDefinition } from '../types.js';
export declare function sessionExists(name: string): boolean;
export declare function sessionInfo(name: string): MutagenSession;
/**
 * A session's configuration (mode, roots, ignore list) is frozen when it is created, so changing it
 * means recreating the session. The hash is kept as a label so that `up` notices the drift by itself
 * instead of waiting for someone to remember about `resync`.
 */
export declare function configHash(session: SessionDefinition): string;
export declare function storedConfigHash(name: string): string;
export declare function createSession(config: Config, session: SessionDefinition): void;
export declare function terminateSession(name: string): void;
export declare function resumeSession(name: string): void;
export declare function flushSession(name: string): void;
export declare function terminateProjectSessions(config: Config): void;
export declare function pauseProjectSessions(config: Config): void;
export declare function existingSessions(config: Config): SessionDefinition[];

import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { containerDigests, containerPath } from '../docker/container.js';
import { isIgnored } from './ignores.js';
import { red } from '../util/colors.js';
const DIGEST_LINE = /^([0-9a-f]{40})\s+\.\/(.+)$/;
function sha1(file) {
    return createHash('sha1').update(readFileSync(file)).digest('hex');
}
function walkHost(config, directory, repoRelativeDirectory, root, manifest) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const repoRelative = repoRelativeDirectory === '' ? entry.name : `${repoRelativeDirectory}/${entry.name}`;
        if (isIgnored(config, repoRelative)) {
            continue;
        }
        const absolute = join(directory, entry.name);
        if (entry.isDirectory()) {
            walkHost(config, absolute, repoRelative, root, manifest);
        }
        else if (entry.isFile()) {
            manifest.set(relative(root, absolute).split(sep).join('/'), sha1(absolute));
        }
    }
}
/**
 * The sha1 sums are computed in Node (fs + crypto) rather than through find/sha1sum, because this
 * runs on Windows, where those tools exist only for whoever has git bash in PATH.
 */
export function hostManifest(config, relativePath) {
    const manifest = new Map();
    const root = relativePath === '.' ? config.repoRoot : join(config.repoRoot, relativePath);
    walkHost(config, root, relativePath === '.' ? '' : relativePath, root, manifest);
    return manifest;
}
export function containerManifest(config, relativePath) {
    const manifest = new Map();
    let output;
    try {
        output = containerDigests(config, relativePath);
    }
    catch {
        console.log(`  ${red('the directory does not exist in the container, or could not be read')}: ${containerPath(config, relativePath)}`);
        return manifest;
    }
    for (const line of output.split('\n')) {
        const match = DIGEST_LINE.exec(line.trim());
        if (match === null) {
            continue;
        }
        const [, digest, file] = match;
        if (digest === undefined || file === undefined) {
            continue;
        }
        if (!isIgnored(config, relativePath === '.' ? file : `${relativePath}/${file}`)) {
            manifest.set(file, digest);
        }
    }
    return manifest;
}
//# sourceMappingURL=manifest.js.map
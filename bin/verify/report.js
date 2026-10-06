import { bold, red, yellow } from '../util/colors.js';
import { containerManifest, hostManifest } from './manifest.js';
function printFileList(config, label, files, paint) {
    if (files.length === 0) {
        return;
    }
    console.log(`  ${paint(`${label} (${files.length})`)}:`);
    for (const file of files.slice(0, config.verifyListLimit)) {
        console.log(`    ${file}`);
    }
    if (files.length > config.verifyListLimit) {
        console.log(`    ... and ${files.length - config.verifyListLimit} more`);
    }
}
/** Compares one path and returns the number of differences that count as a failure. */
export function verifyPath(config, relativePath) {
    console.log(bold(`${relativePath}:`));
    const host = hostManifest(config, relativePath);
    const beta = containerManifest(config, relativePath);
    const missing = [];
    const different = [];
    const extra = [];
    let same = 0;
    for (const [file, digest] of host) {
        const betaDigest = beta.get(file);
        if (betaDigest === undefined) {
            missing.push(file);
        }
        else if (betaDigest === digest) {
            same += 1;
        }
        else {
            different.push(file);
        }
    }
    for (const file of beta.keys()) {
        if (!host.has(file)) {
            extra.push(file);
        }
    }
    console.log(`  identical: ${same}, different: ${different.length}, missing in the container: ${missing.length}`);
    printFileList(config, 'different content', different, red);
    printFileList(config, 'missing in the container', missing, red);
    // Extra files are not a failure in themselves: the main session is one-way, so whatever the
    // container created (caches, logs) is never deleted by mutagen. Hence they are reported but not
    // counted towards the exit code.
    printFileList(config, 'only in the container', extra, yellow);
    return different.length + missing.length;
}
//# sourceMappingURL=report.js.map
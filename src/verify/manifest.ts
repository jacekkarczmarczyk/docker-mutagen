import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { containerDigests, containerPath } from '../docker/container.js';
import { isIgnored } from './ignores.js';
import { red } from '../util/colors.js';
import type { Config } from '../types.js';

const DIGEST_LINE = /^([0-9a-f]{40})\s+\.\/(.+)$/;

function sha1 (file: string): string {
  return createHash('sha1').update(readFileSync(file)).digest('hex');
}

function walkHost (config: Config, directory: string, repoRelativeDirectory: string, root: string, manifest: Map<string, string>): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const repoRelative = repoRelativeDirectory === '' ? entry.name : `${repoRelativeDirectory}/${entry.name}`;

    if (isIgnored(config, repoRelative)) {
      continue;
    }

    const absolute = join(directory, entry.name);

    if (entry.isDirectory()) {
      walkHost(config, absolute, repoRelative, root, manifest);
    } else if (entry.isFile()) {
      manifest.set(relative(root, absolute).split(sep).join('/'), sha1(absolute));
    }
  }
}

/**
 * The sha1 sums are computed in Node (fs + crypto) rather than through find/sha1sum, because this
 * runs on Windows, where those tools exist only for whoever has git bash in PATH.
 */
export function hostManifest (config: Config, relativePath: string): Map<string, string> {
  const manifest = new Map<string, string>();
  const root = relativePath === '.' ? config.repoRoot : join(config.repoRoot, relativePath);

  walkHost(config, root, relativePath === '.' ? '' : relativePath, root, manifest);

  return manifest;
}

export function containerManifest (config: Config, relativePath: string): Map<string, string> {
  const manifest = new Map<string, string>();
  let output: string;

  try {
    output = containerDigests(config, relativePath);
  } catch {
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

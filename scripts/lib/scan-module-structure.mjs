import fs from 'fs';
import path from 'path';

const DEFAULT_SKIP = new Set([path.resolve('src'), path.resolve('src/ui'), path.resolve('src/ui/components'), path.resolve('src/ui/components/atomic')]);

const isSourceFile = (name) =>
  /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.d.ts') && name !== 'config.ts' && !name.endsWith('.worker.ts');

/**
 * @param {string} [root='src']
 * @param {Set<string>} [skipContainerIndex]
 * @returns {{ type: string, path: string }[]}
 */
export function scanModuleStructure(root = 'src', skipContainerIndex = DEFAULT_SKIP) {
  const resolvedRoot = path.resolve(root);
  const violations = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const subdirs = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));
    const files = entries.filter((entry) => entry.isFile() && isSourceFile(entry.name));
    const looseFiles = files.filter((entry) => entry.name !== 'index.ts');
    const dirName = path.basename(dir);
    const hasSubdirs = subdirs.length > 0;

    if (hasSubdirs) {
      for (const file of looseFiles) {
        const base = file.name.replace(/\.(tsx?)$/, '');
        if (base !== dirName) {
          violations.push({ type: 'loose-with-subdirs', path: path.join(dir, file.name) });
        }
      }
    } else if (looseFiles.length > 0) {
      for (const file of looseFiles) {
        const base = file.name.replace(/\.(tsx?)$/, '');
        if (base !== dirName) {
          violations.push({ type: 'file-not-matching-folder', path: path.join(dir, file.name) });
        }
      }

      if (!files.some((entry) => entry.name === 'index.ts')) {
        violations.push({ type: 'missing-index', path: dir });
      }
    }

    if (hasSubdirs && !files.some((entry) => entry.name === 'index.ts') && !skipContainerIndex.has(dir)) {
      violations.push({ type: 'container-missing-index', path: dir });
    }

    for (const subdir of subdirs) {
      walk(path.join(dir, subdir.name));
    }
  }

  walk(resolvedRoot);
  return violations;
}

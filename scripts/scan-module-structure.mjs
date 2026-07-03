import { scanModuleStructure } from './lib/scan-module-structure.mjs';

const violations = scanModuleStructure('src');

console.log(`Remaining violations: ${violations.length}`);
for (const violation of violations) {
  console.log(`${violation.type}|${violation.path}`);
}

process.exit(violations.length > 0 ? 1 : 0);

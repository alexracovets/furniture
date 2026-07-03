import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';
import { scanModuleStructure } from './lib/scan-module-structure.mjs';

const forbiddenPaths = ['src/gizmo', 'src/shaders', 'src/features'];

const CONFIGURATOR_3D_CONSTANTS = [
  'FULL_UV_BOUNDS',
  'PRINT_ATLAS_WIDTH',
  'PRINT_ATLAS_HEIGHT',
  'NAME_SLOT_COUNT',
  'LOGO_SLOT_COUNT',
  'FONT_FAMILY_BY_NAME',
  'PATTERN_LAYER_COUNT',
];

const TYPE_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*Type$/;

const TYPE_ROOTS = ['src/types', 'src/configurator/types'];

const walkSourceFiles = (dir, files = []) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (!statSync(fullPath).isDirectory()) {
      if (/\.(ts|tsx|mts)$/.test(entry)) files.push(fullPath);
      continue;
    }
    if (entry === 'node_modules' || entry === '.next') continue;
    walkSourceFiles(fullPath, files);
  }
  return files;
};

const normalizePath = (filePath) => filePath.replace(/\\/g, '/');

const extractDeclaredTypeNames = (content) => {
  const names = [];
  const patterns = [/export\s+type\s+([A-Za-z0-9_]+)\s*=/g, /export\s+interface\s+([A-Za-z0-9_]+)\s*\{/g];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      names.push(match[1]);
    }
  }

  return names;
};

const importRules = [
  {
    id: 'store-configurator-subpaths',
    test: (filePath) => normalizePath(filePath).includes('src/store/'),
    patterns: [/from ['"]@configurator\/(utils|scene|runtime|canvas|hooks|gizmo|shaders|providers)(?:\/|['"])/],
    message: '@store must use @configurator bootstrap facade, @configurator/mappers, or @configurator/constants — not layer subpaths.',
  },
  {
    id: 'atoms-store-configurator',
    test: (filePath) => normalizePath(filePath).includes('src/ui/components/atomic/atoms/'),
    patterns: [/from ['"]@store['"]/, /from ['"]@configurator(?:\/|['"])/],
    message: 'Atoms must stay presentational — no @store or @configurator imports.',
  },
  {
    id: 'configurator-no-utils',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/'),
    patterns: [/from ['"]@utils(?:\/|['"])/],
    message: '@configurator must not import @utils.',
  },
  {
    id: 'molecules-configurator-types-only',
    test: (filePath) => normalizePath(filePath).includes('src/ui/components/atomic/molecules/'),
    patterns: [/from ['"]@configurator(?!\/types)(?:\/|['"])/],
    message: 'Molecules may only import @configurator/types, not the configurator runtime.',
  },
  {
    id: 'configurator-no-utils-subpaths',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/'),
    patterns: [/from ['"]@configurator\/utils\/(loading|print|material|render)(?:\/|['"])/],
    message: 'Use @configurator/utils barrel — not @configurator/utils/loading|print|material|render subpaths.',
  },
  {
    id: 'no-parent-relative-imports',
    test: (filePath) => {
      const normalized = normalizePath(filePath);
      if (!normalized.endsWith('.ts') && !normalized.endsWith('.tsx')) return false;
      if (normalized.endsWith('/index.ts') || normalized.endsWith('/index.tsx')) return false;
      return normalized.includes('src/');
    },
    patterns: [/^\s*import\s+.*from\s+['"]\.\.\//m, /^\s*import\s+.*from\s+['"]\.\//m],
    message: 'Use @ path aliases for imports — not relative ./ or ../ (index.ts barrel re-exports are exempt).',
  },
];

const pathViolations = forbiddenPaths.filter((path) => existsSync(path));

const importViolations = [];
const constantViolations = [];
const typeNameViolations = [];

for (const filePath of walkSourceFiles('src')) {
  const normalized = normalizePath(filePath);
  const content = readFileSync(filePath, 'utf8');

  for (const rule of importRules) {
    if (!rule.test(filePath)) continue;
    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        importViolations.push({ filePath: normalized, rule: rule.id, message: rule.message });
        break;
      }
    }
  }

  if (normalized.includes('src/configurator/')) continue;
  if (!content.includes('@constants')) continue;

  const usesMovedConstant = CONFIGURATOR_3D_CONSTANTS.some((symbol) => content.includes(symbol));
  if (usesMovedConstant) {
    constantViolations.push({
      filePath: normalized,
      message: '3D pipeline constants belong in @configurator/constants, not @constants.',
    });
  }
}

for (const root of TYPE_ROOTS) {
  if (!existsSync(root)) continue;

  for (const filePath of walkSourceFiles(root)) {
    const normalized = normalizePath(filePath);
    if (normalized.endsWith('/index.ts')) continue;

    const content = readFileSync(filePath, 'utf8');
    for (const typeName of extractDeclaredTypeNames(content)) {
      if (!TYPE_NAME_PATTERN.test(typeName)) {
        typeNameViolations.push({
          filePath: normalized,
          typeName,
          message: 'Exported types must use PascalCase and end with the Type suffix (e.g. CartItemType).',
        });
      }
    }
  }
}

const moduleStructureViolations = scanModuleStructure('src');

const hasViolations =
  pathViolations.length > 0 ||
  importViolations.length > 0 ||
  constantViolations.length > 0 ||
  typeNameViolations.length > 0 ||
  moduleStructureViolations.length > 0;

if (hasViolations) {
  console.error('Architecture guard failed.\n');

  if (pathViolations.length > 0) {
    console.error('Forbidden legacy paths:');
    pathViolations.forEach((path) => console.error(`  - ${path}`));
    console.error('');
  }

  if (moduleStructureViolations.length > 0) {
    console.error('Module folder structure violations:');
    moduleStructureViolations.forEach(({ type, path: filePath }) => console.error(`  - [${type}] ${filePath.replace(/\\/g, '/')}`));
    console.error('  Expected: ModuleName/ModuleName.ts(x) + index.ts (see ARCHITECTURE.md § Module folder pattern).\n');
  }

  if (typeNameViolations.length > 0) {
    console.error('Type naming violations:');
    typeNameViolations.forEach(({ filePath, typeName, message }) => console.error(`  - ${filePath}: ${typeName}\n    ${message}`));
    console.error('');
  }

  if (importViolations.length > 0) {
    console.error('Import boundary violations:');
    importViolations.forEach(({ filePath, message }) => console.error(`  - ${filePath}\n    ${message}`));
    console.error('');
  }

  if (constantViolations.length > 0) {
    console.error('3D constants imported outside configurator:');
    constantViolations.forEach(({ filePath, message }) => console.error(`  - ${filePath}\n    ${message}`));
  }

  exit(1);
}

console.log('Architecture guard passed.');

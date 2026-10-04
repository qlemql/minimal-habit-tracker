const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Capture scripts use the same labels as the app; copy edits must not leave stale selectors.
const load = (name) => {
  const filename = path.resolve(__dirname, '../../src/renewal', name);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('exports', 'module', compiled)(module.exports, module);
  return module.exports;
};
module.exports = { ...load('copy.ts'), ...load('ideas.ts'), ...load('releaseCopy.ts'), ...load('legalCopy.ts') };

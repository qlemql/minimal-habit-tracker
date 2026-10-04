import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const require = createRequire(import.meta.url);
describe('security upgrades at their real integration boundaries', () => {
  it('decodes international route parameters and preserves form spaces', () => {
    const query = require('query-string');
    expect(query.parse('id=%EC%8A%B5%EA%B4%80&name=%E7%BF%92%E6%85%A3+%F0%9F%93%96&plus=%2B'))
      .toEqual({ id: '습관', name: '習慣 📖', plus: '+' });
    expect(query.parse(query.stringify({ name: '読書', id: 'a/b?c=d' })))
      .toEqual({ name: '読書', id: 'a/b?c=d' });
  });
  it('handles a long malformed route without hanging the process', () => {
    // A child-process timeout protects the runner if an unsafe decoder is reintroduced.
    const result = execFileSync(process.execPath, ['-e', `
      const q = require('query-string');
      const input = '%FF'.repeat(10000);
      const value = q.parse('id=' + input).id;
      if (value !== input) process.exit(2);
      process.stdout.write('ok');
    `], { cwd: process.cwd(), timeout: 5000, encoding: 'utf8' });
    expect(result).toBe('ok');
  });
  it('Metro can still load image assets through its file-path API', async () => {
    const metro = require('metro/private/Assets');
    const data = await metro.getAssetData(path.resolve('assets/icon.png'), 'assets/icon.png', [], null, '/assets');
    expect(data).toMatchObject({ width: 1024, height: 1024, type: 'png' });
  });
  it('Xcode project generation still produces 24-character identifiers', () => {
    const project = require('xcode').project('test.pbxproj');
    project.hash = { project: { objects: {} } };
    const first = project.generateUuid();
    expect(first).toMatch(/^[A-F0-9]{24}$/);
    expect(project.generateUuid()).not.toBe(first);
  });
});

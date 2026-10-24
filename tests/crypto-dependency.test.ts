import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

it('rejects the node-forge nested DigestAlgorithm attack while preserving valid signatures',()=>{
  expect(execFileSync(process.execPath,['scripts/check-forge-security.cjs'],{encoding:'utf-8'})).toContain('checks passed');
});

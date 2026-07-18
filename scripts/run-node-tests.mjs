import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(args) {
  return spawnSync(npmCommand, args, { stdio: 'inherit' }).status ?? 1;
}

const rebuildStatus = run(['run', 'rebuild:node']);
if (rebuildStatus !== 0) process.exit(rebuildStatus);

let testStatus = 1;
try {
  testStatus = run(['exec', 'vitest', 'run']);
} finally {
  // Mantém o workspace pronto para `npm run dev`, mesmo quando um teste falha.
  const electronRebuildStatus = run(['run', 'rebuild:electron']);
  if (testStatus === 0 && electronRebuildStatus !== 0) testStatus = electronRebuildStatus;
}

process.exit(testStatus);

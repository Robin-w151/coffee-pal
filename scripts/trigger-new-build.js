import { execSync } from 'child_process';

function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

function getCurrentCommitMessage() {
  return execSync('git show -s --format=%s').toString().trim();
}

function isMainBranch() {
  return getCurrentBranch() === 'main';
}

function isReleaseCommit() {
  return /^chore\(release\):/.test(getCurrentCommitMessage());
}

if (isMainBranch() && !isReleaseCommit()) {
  process.exit(0);
} else {
  process.exit(1);
}

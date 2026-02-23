function getCurrentBranch() {
  return process.env['VERCEL_GIT_COMMIT_REF'];
}

function getCurrentCommitMessage() {
  return process.env['VERCEL_GIT_COMMIT_MESSAGE'];
}

function isMainBranch() {
  return getCurrentBranch() === 'main';
}

function isReleaseCommit() {
  const message = getCurrentCommitMessage();
  return message?.startsWith('chore(release):') ?? false;
}

if (isMainBranch() && !isReleaseCommit()) {
  process.exit(0);
} else {
  process.exit(1);
}

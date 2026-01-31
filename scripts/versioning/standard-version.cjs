const { execSync } = require('node:child_process');

function bumpVersion(repoRoot, releaseAs) {
	execSync(`npx standard-version --release-as ${releaseAs}`, {
		cwd: repoRoot,
		stdio: 'inherit',
	});
}

module.exports = {
	bumpVersion,
};

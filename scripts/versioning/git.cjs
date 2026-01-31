const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function readHeadPackageJsonVersion(repoRoot) {
	try {
		const content = execSync('git show HEAD:package.json', {
			cwd: repoRoot,
			encoding: 'utf8',
		});
		return JSON.parse(content).version;
	} catch {
		return null;
	}
}

function restorePackageJsonFromHead(repoRoot) {
	const content = execSync('git show HEAD:package.json', {
		cwd: repoRoot,
		encoding: 'utf8',
	});
	fs.writeFileSync(path.join(repoRoot, 'package.json'), content);
}

module.exports = {
	readHeadPackageJsonVersion,
	restorePackageJsonFromHead,
};

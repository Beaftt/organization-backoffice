const fs = require('node:fs');
const path = require('node:path');

function readPackageJsonVersion(repoRoot) {
	const content = fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8');
	return JSON.parse(content).version;
}

module.exports = {
	readPackageJsonVersion,
};

const path = require('node:path');

const { closeTty, getTtyStreams } = require('./tty.cjs');
const {
	readHeadPackageJsonVersion,
	restorePackageJsonFromHead,
} = require('./git.cjs');
const { readPackageJsonVersion } = require('./package-json.cjs');
const { bumpVersion } = require('./standard-version.cjs');
const { promptBumpType, promptPendingVersionChange } = require('./prompts.cjs');
const { log } = require('./log.cjs');

async function run() {
	const repoRoot = path.join(__dirname, '..', '..');

	if (process.env.CI === 'true' || process.env.CI === '1') {
		return;
	}

	const tty = getTtyStreams();
	if (!tty) return;

	try {
		let currentVersion = readPackageJsonVersion(repoRoot);
		const headVersion = readHeadPackageJsonVersion(repoRoot);

		if (headVersion && headVersion !== currentVersion) {
			const decision = await promptPendingVersionChange({
				tty,
				headVersion,
				currentVersion,
			});
			if (decision.note) tty.output.write(`${decision.note}\n`);

			if (decision.action === 'keep') {
				tty.output.write('Keeping current version and continuing.\n');
				return;
			}

			if (decision.action === 'abort') {
				tty.output.write('Commit cancelled by user.\n');
				process.exitCode = 1;
				return;
			}

			if (decision.action === 'redo') {
				restorePackageJsonFromHead(repoRoot);
				currentVersion = readPackageJsonVersion(repoRoot);
				tty.output.write(`Version restored to: ${currentVersion}\n`);
			}
		}

		const bumpChoice = await promptBumpType({ tty, currentVersion });
		if (bumpChoice.note) tty.output.write(`${bumpChoice.note}\n`);

		if (bumpChoice.action === 'skip') {
			tty.output.write('Skipping version bump.\n');
			return;
		}

		bumpVersion(repoRoot, bumpChoice.releaseAs);

		const newVersion = readPackageJsonVersion(repoRoot);
		tty.output.write(
			`Version updated: ${currentVersion} -> ${newVersion}\n`,
		);
	} finally {
		await closeTty(tty);
	}
}

if (require.main === module) {
	run().catch((err) => {
		log.error(`${String(err?.message ?? err)}\n`);
		process.exit(1);
	});
}

module.exports = {
	run,
};

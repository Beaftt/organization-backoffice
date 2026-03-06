const { log } = require('./log.cjs');

function bumpVersionString(version, type) {
	const parts = version.split('.').map(Number);
	const major = parts[0] ?? 0;
	const minor = parts[1] ?? 0;
	const patch = parts[2] ?? 0;
	if (type === 'major') return `${major + 1}.0.0`;
	if (type === 'minor') return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function promptQuestion({ tty, question, allowed }) {
	return new Promise((resolve) => {
		const onData = (data) => {
			const answer = String(data || '').trim().toLowerCase();
			if (!answer) return;
			if (!allowed.has(answer)) return;
			tty.input.off('data', onData);
			resolve(answer);
		};

		log.info(`${question}\n`);
		tty.input.on('data', onData);
	});
}

async function promptPendingVersionChange({ tty, headVersion, currentVersion }) {
	log.info(
		`Detected version change since last commit (HEAD: ${headVersion}, current: ${currentVersion}).\n`,
	);
	log.info('Choose: (k)eep, (r)edo, (a)bort\n');

	const answer = await promptQuestion({
		tty,
		question: 'Your choice: ',
		allowed: new Set(['k', 'r', 'a']),
	});

	if (answer === 'k') {
		return { action: 'keep' };
	}
	if (answer === 'a') {
		return { action: 'abort' };
	}
	return { action: 'redo' };
}

async function promptBumpType({ tty, currentVersion }) {
	const patchV = bumpVersionString(currentVersion, 'patch');
	const minorV = bumpVersionString(currentVersion, 'minor');
	const majorV = bumpVersionString(currentVersion, 'major');

	log.info(`Current version: ${currentVersion}\n`);
	log.info(`Select bump:\n`);
	log.info(`  (p) ${patchV}  - patch (bugfix)\n`);
	log.info(`  (m) ${minorV}  - minor (new feature)\n`);
	log.info(`  (M) ${majorV}  - major (breaking changes)\n`);
	log.info(`  (s) skip\n`);

	const answer = await promptQuestion({
		tty,
		question: 'Your choice: ',
		allowed: new Set(['p', 'm', 'M', 's']),
	});

	if (answer === 's') {
		return { action: 'skip' };
	}

	const releaseAs =
		answer === 'M' ? 'major' : answer === 'm' ? 'minor' : 'patch';
	return { action: 'bump', releaseAs };
}

module.exports = {
	promptBumpType,
	promptPendingVersionChange,
};

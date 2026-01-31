const { log } = require('./log.cjs');

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
	log.info(`Current version: ${currentVersion}\n`);
	log.info('Select bump: (p)atch, (m)inor, (M)ajor, (s)kip\n');

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

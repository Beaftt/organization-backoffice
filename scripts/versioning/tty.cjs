function getTtyStreams() {
	if (!process.stdin.isTTY || !process.stdout.isTTY) return null;
	return {
		input: process.stdin,
		output: process.stdout,
	};
}

async function closeTty(tty) {
	if (!tty) return;
	if (tty.input?.destroy) tty.input.destroy();
}

module.exports = {
	closeTty,
	getTtyStreams,
};

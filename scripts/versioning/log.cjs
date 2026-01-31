const log = {
	info: (message) => {
		process.stdout.write(String(message));
	},
	error: (message) => {
		process.stderr.write(String(message));
	},
};

module.exports = {
	log,
};

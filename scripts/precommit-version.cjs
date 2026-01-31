const { run } = require('./versioning/precommit-version.cjs');
const { log } = require('./versioning/log.cjs');

if (require.main === module) {
	run().catch((err) => {
		log.error(`${String(err?.message ?? err)}\n`);
		process.exit(1);
	});
}

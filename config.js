// config.js
if (!process.env.ADMIN_KEY) {
	console.error("❌ ERROR: Missing ADMIN_KEY in environment variables");
	process.exit(1); // Stop the server for safety
}

const config = Object.freeze({
	adminKey: process.env.ADMIN_KEY,
});

module.exports = config;

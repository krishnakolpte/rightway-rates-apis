const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: Number(process.env.SMTP_PORT) === 465, // auto-select secure mode
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	tls: {
		rejectUnauthorized: false, // prevents SSL issues on shared hosting
	},
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
	if (error) {
		console.error("❌ SMTP Connection Failed:", error);
	} else {
		console.log("📨 SMTP Server Ready to Send Emails");
	}
});

module.exports = transporter;

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const { fetchDailyRates, getStoredRates } = require("./metalsService");
const tracker = require("./requestTracker");
const config = require("./config");

const app = express();

// ------------------------
// SECURE CORS — Allow only selected frontends
// ------------------------

app.use(
	cors({
		origin: true, // Allow all origins
		methods: ["GET"],
		allowedHeaders: ["Content-Type"],
	}),
);

// Global CORS error handler
app.use((err, req, res, next) => {
	if (err.message === "❌ CORS: Origin Not Allowed") {
		return res
			.status(403)
			.json({ status: "error", message: "CORS Blocked" });
	}
	next();
});

app.use(express.json());

// ------------------------
// CRON JOB — Fetch once/day at 12:00 PM
// ------------------------
cron.schedule("0 12 * * *", async () => {
	try {
		await fetchDailyRates();
	} catch (err) {
		console.error("❌ Daily cron fetch failed:", err.message);
	}
});

// Fetch once on startup
fetchDailyRates().catch((err) =>
	console.error("❌ Startup fetch failed:", err.message),
);

// ------------------------
// PUBLIC ENDPOINT — Unlimited user requests
// ------------------------
app.get("/rates", (req, res) => {
	try {
		tracker.trackUser(); // count user request
		const data = getStoredRates();

		res.json({
			status: "success",
			userRequests: tracker.getCounts().userRequests,
			rates: data,
		});
	} catch (err) {
		console.error("❌ /rates failed:", err.message);
		res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
});

// ------------------------
// ADMIN ENDPOINT
// ------------------------
app.get("/admin/stats", (req, res) => {
	try {
		if (req.query.key !== config.adminKey)
			return res.status(401).json({ message: "Unauthorized" });

		res.json({
			status: "success",
			...tracker.getCounts(),
			storedRates: getStoredRates(),
		});
	} catch (err) {
		res.status(500).json({ status: "error", message: "Internal error" });
	}
});

// ------------------------
// START SERVER
// ------------------------
app.listen(process.env.PORT, () => {
	console.log(`🚀 Server running on port ${process.env.PORT}`);
});

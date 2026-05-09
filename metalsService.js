const axios = require("axios");
const fs = require("fs");

const DATA_FILE = "./rates.json";
let serverCallCount = 0;

// ------------------------------------
// Read stored rates safely
// ------------------------------------
function getStoredRates() {
	if (!fs.existsSync(DATA_FILE)) return {};
	try {
		return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
	} catch {
		return {};
	}
}

// ------------------------------------
// Fetch metals.dev – runs daily
// ------------------------------------
async function fetchDailyRates() {
	console.log("⏳ Fetching metals.dev rates...");

	try {
		const response = await axios.get(process.env.API_URL);
		serverCallCount++;

		const metals = response.data.metals;

		// Validate expected fields exist
		if (
			!metals ||
			typeof metals.gold !== "number" ||
			typeof metals.silver !== "number"
		) {
			throw new Error("Invalid metals.dev response format");
		}

		// Save only gold & silver (INR per KG)
		const data = {
			updatedAt: new Date().toISOString(),
			gold: Math.round(metals.gold),
			silver: Math.round(metals.silver),
			serverCallCount,
		};

		fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

		console.log("✅ Rates updated:", data);
		return data;
	} catch (err) {
		console.error("❌ metals.dev failed:", err.message);

		// fallback to last stored rates
		return getStoredRates();
	}
}

module.exports = {
	fetchDailyRates,
	getStoredRates,
};

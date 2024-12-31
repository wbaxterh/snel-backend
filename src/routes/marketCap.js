const express = require("express");
const { fetchBlockfrost } = require("../utils/blockfrost");

const router = express.Router();
const SNEL_ASSET_ID =
	"067cac6082f8661b6e14909b40590120bf0bf02c21f5d07ee03d0e02534e654c";

router.get("/", async (req, res) => {
	try {
		console.log("Fetching market cap for SNeL...");

		const assetInfo = await fetchBlockfrost(`/assets/${SNEL_ASSET_ID}`);
		const totalSupply = BigInt(assetInfo.quantity);
		const adaPrice = 0.3; // Example price in USD (replace with live API call)
		const marketCap =
			(totalSupply * BigInt(Math.round(adaPrice * 1e6))) / BigInt(1e6);

		res.json({ marketCap: marketCap.toString() });
	} catch (error) {
		console.error("Error fetching market cap:", error.message);
		res.status(500).json({ error: "Failed to fetch market cap." });
	}
});

module.exports = router;

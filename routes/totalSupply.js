const express = require("express");
const { fetchBlockfrost } = require("../utils/blockfrost");

const router = express.Router();
const SNEL_ASSET_ID =
	"067cac6082f8661b6e14909b40590120bf0bf02c21f5d07ee03d0e02534e654c";

router.get("/", async (req, res) => {
	try {
		console.log("Fetching total supply for SNeL...");
		const assetInfo = await fetchBlockfrost(`/assets/${SNEL_ASSET_ID}`);
		res.json({ totalSupply: assetInfo.quantity });
	} catch (error) {
		console.error("Error fetching total supply:", error.message);
		res.status(500).json({ error: "Failed to fetch total supply." });
	}
});

module.exports = router;

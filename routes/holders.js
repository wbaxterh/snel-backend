const express = require("express");
const { fetchBlockfrost } = require("../utils/blockfrost");

const router = express.Router();
const SNEL_ASSET_ID =
	"067cac6082f8661b6e14909b40590120bf0bf02c21f5d07ee03d0e02534e654c";

router.get("/", async (req, res) => {
	try {
		console.log("Fetching holders for SNeL asset...");

		const assetAddresses = await fetchBlockfrost(
			`/assets/${SNEL_ASSET_ID}/addresses`,
			{
				count: 100,
				page: 1,
			}
		);

		if (!assetAddresses.length) {
			return res
				.status(404)
				.json({ message: "No holders found for this asset." });
		}

		// Format holders and calculate the count
		const holders = assetAddresses.map(({ address, quantity }) => ({
			address,
			quantity,
		}));

		const holderCount = holders.length;

		res.json({ asset: SNEL_ASSET_ID, holders, holderCount });
	} catch (error) {
		console.error("Error fetching SNeL holders:", error.message);
		res
			.status(500)
			.json({ error: "An error occurred while fetching SNeL holders." });
	}
});

module.exports = router;

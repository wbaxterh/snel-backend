const express = require("express");
const { fetchBlockfrost } = require("../utils/blockfrost");

const router = express.Router();
const SNEL_ASSET_ID =
	"067cac6082f8661b6e14909b40590120bf0bf02c21f5d07ee03d0e02534e654c";

// Helper function to fetch and calculate volume from transaction outputs
const calculateVolumeFromTransactions = async (transactions) => {
	let totalVolume = BigInt(0);

	for (const tx of transactions) {
		try {
			// Fetch UTXOs for the transaction
			const outputs = await fetchBlockfrost(`/txs/${tx.tx_hash}/utxos`);

			// Sum up the quantities for the SNeL asset
			for (const output of outputs.outputs) {
				const asset = output.amount.find((a) => a.unit === SNEL_ASSET_ID);
				if (asset) {
					totalVolume += BigInt(asset.quantity);
				}
			}
		} catch (error) {
			console.error(
				`Error fetching UTXOs for transaction ${tx.tx_hash}:`,
				error.message
			);
		}
	}

	return totalVolume;
};

// Endpoint to calculate 24-hour volume
router.get("/", async (req, res) => {
	try {
		console.log("Fetching transactions for SNeL asset...");

		// Fetch transactions for the SNeL asset
		const transactions = await fetchBlockfrost(
			`/assets/${SNEL_ASSET_ID}/transactions`,
			{
				count: 100,
				page: 1,
			}
		);

		if (!transactions.length) {
			return res.json({ volume: "0" });
		}

		// Calculate the total volume from transaction outputs
		const totalVolume = await calculateVolumeFromTransactions(transactions);

		res.json({ volume: totalVolume.toString() });
	} catch (error) {
		console.error("Error fetching 24-hour volume:", error.message);
		res.status(500).json({ error: "Failed to fetch 24-hour volume." });
	}
});

module.exports = router;

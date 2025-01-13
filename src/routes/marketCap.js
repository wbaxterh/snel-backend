const express = require("express");
const axios = require("axios");
const { fetchBlockfrost } = require("../utils/blockfrost");

const router = express.Router();
const SNEL_ASSET_ID =
	"067cac6082f8661b6e14909b40590120bf0bf02c21f5d07ee03d0e02534e654c";
const LIQUIDITY_POOL_ADDRESS =
	"addr1x89ksjnfu7ys02tedvslc9g2wk90tu5qte0dt4dge60hdudj764lvrxdayh2ux30fl0ktuh27csgmpevdu89jlxppvrsg0g63z";
const TOTAL_SUPPLY = 1_000_000_000; // Total supply of SNeL

// Fetch ADA/USD price
const fetchAdaPrice = async () => {
	try {
		const response = await axios.get(
			"https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd"
		);
		return response.data.cardano.usd; // ADA price in USD
	} catch (error) {
		console.error("Error fetching ADA price from CoinGecko:", error.message);
		throw new Error("Failed to fetch ADA price.");
	}
};

// Fetch liquidity pool data
const fetchLiquidityPoolData = async () => {
	try {
		const response = await fetchBlockfrost(
			`/assets/${SNEL_ASSET_ID}/transactions?order=desc`
		);

		if (!response || response.length === 0)
			throw new Error("No transactions found for SNeL.");

		for (const tx of response) {
			const utxo = await fetchBlockfrost(`/txs/${tx.tx_hash}/utxos`);

			for (const output of utxo.outputs) {
				if (output.address === LIQUIDITY_POOL_ADDRESS) {
					const adaReserve = output.amount.find(
						(amount) => amount.unit === "lovelace"
					)?.quantity;
					const snelReserve = output.amount.find(
						(amount) => amount.unit === SNEL_ASSET_ID
					)?.quantity;

					// Convert lovelace to ADA
					return {
						adaReserve: parseFloat(adaReserve) / 1e6,
						snelReserve: parseFloat(snelReserve),
					};
				}
			}
		}

		throw new Error("No liquidity pool transaction found.");
	} catch (error) {
		console.error("Error fetching liquidity pool data:", error.message);
		throw error;
	}
};

// Route to calculate market cap
router.get("/", async (req, res) => {
	try {
		// Fetch liquidity pool data
		const { adaReserve, snelReserve } = await fetchLiquidityPoolData();
		console.log("ada reserve in liquidity pool == ", adaReserve);
		console.log("snel reserve in liquidity pool == ", snelReserve);
		if (!adaReserve || !snelReserve) {
			throw new Error("Invalid liquidity pool data.");
		}

		// Calculate the price of SNeL in ADA
		const snelPriceInADA = adaReserve / snelReserve;
		console.log("snel price in ada == ", snelPriceInADA);

		// Fetch ADA/USD price
		const adaPriceInUSD = await fetchAdaPrice();
		const snelPriceInUSD = snelPriceInADA * adaPriceInUSD;

		// Use total supply for circulating supply
		const circulatingSupply = TOTAL_SUPPLY;

		// Calculate market cap in USD
		const marketCap = circulatingSupply * snelPriceInUSD;

		res.json({
			priceInADA: snelPriceInADA.toFixed(6),
			priceInUSD: snelPriceInUSD.toFixed(6),
			marketCap: marketCap.toFixed(2),
			circulatingSupply: circulatingSupply.toLocaleString(),
		});
	} catch (error) {
		console.error("Error calculating market cap:", error.message);
		res.status(500).json({ error: "Failed to calculate market cap." });
	}
});

module.exports = router;

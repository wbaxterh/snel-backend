const axios = require("axios");

const BLOCKFROST_BASE_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY;

const fetchBlockfrost = async (endpoint, params = {}) => {
	try {
		const response = await axios.get(`${BLOCKFROST_BASE_URL}${endpoint}`, {
			headers: { project_id: BLOCKFROST_API_KEY },
			params,
		});
		return response.data;
	} catch (error) {
		console.error(
			`Error fetching ${endpoint}:`,
			error.response?.data || error.message
		);
		throw new Error("Failed to fetch data from Blockfrost");
	}
};

module.exports = { fetchBlockfrost };

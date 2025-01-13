const express = require("express");
const axios = require("axios");
const router = express.Router();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// In-memory cache for the follower count
let cachedFollowers = null;
let lastFetchTime = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Fetch followers count
const getFollowersCount = async () => {
	try {
		// Serve cached data if within the cache duration
		if (cachedFollowers && Date.now() - lastFetchTime < CACHE_DURATION) {
			return cachedFollowers;
		}

		// Fetch data from Twitter API
		const url = "https://api.twitter.com/2/users/me";
		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${BEARER_TOKEN}`,
			},
		});
		console.log("repsonse == ", response);
		const followersCount = response.data.data.public_metrics.followers_count;

		// Update cache
		cachedFollowers = followersCount;
		lastFetchTime = Date.now();

		return followersCount;
	} catch (error) {
		console.error("Error fetching followers count:", error.message);
		throw new Error("Unable to fetch followers count");
	}
};

// Define the route
router.get("/", async (req, res) => {
	try {
		const followersCount = await getFollowersCount();
		res.json({ username: "snelcoin", followers: followersCount });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;

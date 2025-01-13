require("dotenv").config();
const express = require("express");
const cors = require("cors");
const awsServerlessExpress = require("aws-serverless-express");

console.log("Environment variable:", process.env.BLOCKFROST_API_KEY);
const holdersRoute = require("./routes/holders");
const totalSupplyRoute = require("./routes/totalSupply");
const marketCapRoute = require("./routes/marketCap");
const volumeRoute = require("./routes/volume");
const followersRoute = require("./routes/followers");

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
	"http://localhost:3000",
	"https://snel.fun",
	"https://www.snel.fun",
	"https://api.snel.fun", // Include subdomains if necessary
];

// Enable CORS
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or Postman)
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: "GET,POST", // Specify allowed HTTP methods
		allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
		credentials: true, // Allow credentials if needed
	})
);

// Add middleware to parse JSON payloads
app.use(express.json());

// Discord bot
const discordBot = require("./utils/discordBot"); // Import your Discord bot logic

app.post("/api/webhook", async (req, res) => {
	try {
		const event = req.body;

		// Log the incoming event for debugging
		console.log("Webhook event received:", event);

		// Process transaction data and notify Discord
		await discordBot.handleTransaction(event);

		res.status(200).send("Webhook received and processed.");
	} catch (error) {
		console.error("Error processing webhook:", error.message);
		res.status(500).send("Internal server error.");
	}
});

// Use routes
app.use("/api/snel-holders", holdersRoute);
app.use("/api/snel-total-supply", totalSupplyRoute);
app.use("/api/snel-marketcap", marketCapRoute);
app.use("/api/snel-volume", volumeRoute);
app.use("/api/snel-followers", followersRoute);

// Conditionally export or start the server
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
	const server = awsServerlessExpress.createServer(app);
	exports.handler = (event, context) =>
		awsServerlessExpress.proxy(server, event, context);
} else {
	// Start the app locally
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
}

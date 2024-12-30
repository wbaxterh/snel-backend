require("dotenv").config();
const express = require("express");
const cors = require("cors");

const holdersRoute = require("./routes/holders");
const totalSupplyRoute = require("./routes/totalSupply");
const marketCapRoute = require("./routes/marketCap");
const volumeRoute = require("./routes/volume");

const app = express();
const port = process.env.PORT || 3001;
// Enable CORS
app.use(
	cors({
		origin: "http://localhost:3000", // Allow only your React app during development
		methods: "GET,POST", // Specify allowed HTTP methods
	})
);

// Use routes
app.use("/api/snel-holders", holdersRoute);
app.use("/api/snel-total-supply", totalSupplyRoute);
app.use("/api/snel-marketcap", marketCapRoute);
app.use("/api/snel-volume", volumeRoute);

// Start the server
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});

require("dotenv").config();
const express = require("express");

const holdersRoute = require("./routes/holders");
const totalSupplyRoute = require("./routes/totalSupply");
const marketCapRoute = require("./routes/marketCap");
const volumeRoute = require("./routes/volume");

const app = express();
const port = process.env.PORT || 3001;

// Use routes
app.use("/api/snel-holders", holdersRoute);
app.use("/api/snel-total-supply", totalSupplyRoute);
app.use("/api/snel-marketcap", marketCapRoute);
app.use("/api/snel-volume", volumeRoute);

// Start the server
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});

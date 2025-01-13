const { Client, GatewayIntentBits } = require("discord.js");

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!DISCORD_BOT_TOKEN) {
	console.error("DISCORD_BOT_TOKEN is missing!");
	process.exit(1);
}
// Login to Discord
client.login(DISCORD_BOT_TOKEN);

client.once("ready", () => {
	console.log("Discord bot is ready!");
});

// Handle incoming transaction events
async function handleTransaction(event) {
	if (!client.isReady()) {
		console.error("Discord client is not ready.");
		return;
	}

	// Format the transaction details for Discord
	const embed = {
		title: "New SNeL Transaction Detected! 🚀",
		description: `A new transaction involving **SNeL** just occurred!`,
		fields: [
			{
				name: "Transaction ID",
				value: `[View on Explorer](https://cardanoscan.io/transaction/${event.tx_hash})`,
				inline: false,
			},
			{ name: "Amount", value: `${event.amount} SNeL`, inline: true },
			{ name: "Sender", value: `${event.sender}`, inline: true },
			{ name: "Receiver", value: `${event.receiver}`, inline: true },
		],
		color: 0x00ff00,
		timestamp: new Date(),
	};

	// Send the message to Discord
	const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
	if (channel) {
		await channel.send({ embeds: [embed] });
		console.log("Notification sent to Discord.");
	} else {
		console.error("Discord channel not found.");
	}
}

module.exports = { handleTransaction };

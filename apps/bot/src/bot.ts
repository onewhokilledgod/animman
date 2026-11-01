import { Bot } from "grammy";
import { BOT_TOKEN } from "@animman/bot/config";
import { startCommand } from "@animman/bot/commands/start";
import http from "http";

const server = http.createServer((req, res) => {
	return res.writeHead(200).end();
});

server.listen(
	process.env.SERVER_PORT,
	Number(process.env.SERVER_HOST_NAME),
	() => {
		console.log("server is working");
	}
);

export const bot = new Bot(BOT_TOKEN);

bot.command("start", startCommand);

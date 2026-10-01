import { Request, Response } from "express";
import { parse, isValid, type InitData } from "@tma.js/init-data-node";
import jwt from "jsonwebtoken";
import prisma from "@animman/server/prisma";
import InitDataError from "@animman/server/errors/initDataError";
import { User } from "@prisma/client";
import "dotenv/config";

class UserController {
	async auth(req: Request, res: Response) {
		const { initData } = req.body as { initData: string };
		let userTgData: InitData | undefined;
		let user: User | null;

		try {
			userTgData = initDataVerify(initData);
			user = await prisma.user.upsert({
				where: { telegramId: userTgData.user?.id.toString() },
				update: {
					username: userTgData.user?.username,
					firstName: userTgData.user?.first_name,
					lastName: userTgData.user?.last_name,
					photoUrl: userTgData.user?.photo_url
				},
				create: {
					telegramId: userTgData.user?.id.toString()!,
					username: userTgData.user?.username,
					firstName: userTgData.user?.first_name,
					lastName: userTgData.user?.last_name,
					photoUrl: userTgData.user?.photo_url
				}
			});
		} catch (err) {
			err instanceof Error
				? res.status(400).json({
						error: `${err.name}: ${err.message}`
					})
				: null;
			return;
		}

		const token = jwt.sign(
			{
				userId: user.id
			},
			process.env.JWT_SECRET!,
			{ expiresIn: "7d" }
		);

		res.cookie("token", token, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production"
		});
		res.json({
			message: "Authorized",
			user
		});
	}

	async isAuth(req: Request, res: Response) {
		const { initData } = req.body as { initData: string };
		let userTgData: InitData | undefined;
		let userDB: User | null;

		try {
			userTgData = initDataVerify(initData);
			userDB = await prisma.user.findUnique({
				where: {
					telegramId: userTgData.user?.id.toString()
				}
			});
		} catch (err) {
			err instanceof Error
				? res.status(400).json({
						error: `${err.name}: ${err.message}`
					})
				: null;
			return;
		}

		console.log(userDB);
		res.status(200).json({
			user: userDB
		});
	}
}

function initDataVerify(initData: string | undefined) {
	if (initData === undefined || !isValid(initData, process.env.BOT_TOKEN!)) {
		throw new InitDataError("Invalid initData");
	}

	return parse(initData);
}

export default new UserController();

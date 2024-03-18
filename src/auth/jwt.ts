import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { IRepositoryBlacklist } from "../repositories";

const secret = process.env.JWT_SECRET || "todo-secrets";

export interface Payload {
	id: number;
	username: string;
}

export interface JwtAuthRequest<Params, Body> extends Request<Params, any, Body> {
	token: string; // | jwt.JwtPayload;
	payload: Payload;
}

// newJwt
export function newJwtMiddleware(data: Payload): string {
	return jwt.sign(data, secret, {
		algorithm: "HS512",
		/** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
		expiresIn: "1h",
		issuer: "todo-api",
		subject: "user-login",
		audience: "user",
	});
}

// jwtMiddleware
export class HandlerMiddleware {
	private repoBlacklist: IRepositoryBlacklist;

	constructor(repoBlacklist: IRepositoryBlacklist) {
		this.repoBlacklist = repoBlacklist;
	}

	public async jwtMiddleware(req: JwtAuthRequest<any, any>, res: Response, next: NextFunction) {
		const token = req.header("Authorization")?.replace("Bearer ", "");
		try {
			if (!token) {
				return res.status(401).json({ error: "missing JWT token" }).end();
			}

			// console.log("middle", { token });

			const isBlacklisted = await this.repoBlacklist.isBlacklisted(token);
			if (isBlacklisted) {
				return res.status(401).json({ status: `Already logged out` }).end();
			}

			const decoded = jwt.verify(token, secret);
			const id = decoded["id"];
			const username = decoded["username"];

			if (!id) {
				return res.status(401).json({ error: "missing payload `id`" }).end();
			}

			if (!username) {
				return res.status(401).json({ error: "missing payload `username`" }).end();
			}

			req.token = token;
			req.payload = {
				// id: decoded["id"],
				id,
				// username: decoded["username"],
				username,
			};

			return next();
		} catch (err) {
			console.error(`Auth failed for token ${token}: ${err}`);

			if (err instanceof TokenExpiredError) {
				return res.status(401).json({ error: "authentication failed for jwt expired" }).end();
			}

			if (err instanceof JsonWebTokenError) {
				return res.status(401).json({ error: "authentication failed for invalid signature" }).end();
			}

			return res.status(500).json({ error: "Internal Server Error" }).end();
		}
	}
}

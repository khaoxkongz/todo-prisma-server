import { Request, Response } from "express";

import { IRepositoryUser } from "../repositories";

import { IUserDto } from "../dto";
import { IEmpty } from "../interfaces";

import { JwtAuthRequest, Payload, compareHash, hashPassword, newJwtMiddleware } from "../auth";
import { IRepositoryBlacklist } from "../repositories/blacklist";

// Custom Express `Request` no Query)
export interface AppRequest<Params, Body> extends Request<Params, any, Body> {}

export type HandlerFunc<Req> = (req: Req, res: Response) => Promise<Response>;

export interface IHandlerUser {
	register: HandlerFunc<AppRequest<IEmpty, IUserDto>>;
	login: HandlerFunc<AppRequest<IEmpty, IUserDto>>;
}

export function newHandlerUser(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist): IHandlerUser {
	return new HandlerUser(repo, repoBlacklist);
}

class HandlerUser implements IHandlerUser {
	private repo: IRepositoryUser;
	private repoBlacklist: IRepositoryBlacklist;

	constructor(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist) {
		this.repo = repo;
		this.repoBlacklist = repoBlacklist;
	}

	public async register(req: AppRequest<IEmpty, IUserDto>, res: Response): Promise<Response> {
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(400).json({ error: "missing username or password" }).end();
		}

		return this.repo
			.createUser({ username, password: hashPassword(password) })
			.then((user) =>
				res
					.status(201)
					.json({ ...user, password: undefined })
					.end()
			)
			.catch((err) => {
				const errMsg = `failed to create user ${username}`;
				console.error(`${errMsg}: ${err}`);
				return res.status(500).json({ error: errMsg }).end();
			});
	}

	public async login(req: AppRequest<IEmpty, IUserDto>, res: Response): Promise<Response> {
		const { username, password: plainpassword } = req.body;
		if (!username || !plainpassword) {
			return res.status(400).json({ error: "missing username or password " }).end();
		}

		return this.repo
			.getUser(username)
			.then((user) => {
				if (!compareHash(plainpassword, user.password)) {
					return res.status(401).json({ error: "invalid username or password " }).end();
				}

				const payload: Payload = { id: user.id, username: user.username };
				const token = newJwtMiddleware(payload);

				return res
					.status(200)
					.json({
						status: "logged in",
						id: user.id,
						username,
						token,
					})
					.end();
			})
			.catch((err) => {
				const errMsg = `failed to get user ${username}`;
				console.error(`${errMsg}: ${err}`);
				return res.status(500).json({ error: errMsg }).end();
			});
	}
}

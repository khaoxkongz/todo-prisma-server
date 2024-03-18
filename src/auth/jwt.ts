import jwt from "jsonwebtoken";

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

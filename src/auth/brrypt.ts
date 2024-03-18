import bcryptjs from "bcryptjs";

export function hashPassword(password: string): string {
	const salt = bcryptjs.genSaltSync(12);

	return bcryptjs.hashSync(password, salt);
}

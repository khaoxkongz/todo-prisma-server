import { RedisClientType } from "redis";

export async function expirer(redis: RedisClientType<any, any, any>) {
	while (1) {
		try {
			await expire(redis);
		} catch (err) {
			console.error(`got error: ${err}`);
			break;
		}

		// Every minute
		await new Promise((r) => setTimeout(r, 60 * 1000));
	}
}

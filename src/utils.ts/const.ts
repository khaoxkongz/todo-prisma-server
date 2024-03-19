export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/";

export const BLACKLIST_KEY = "jwt-blacklist";
export const EXPIRATION_KEY = "jwt-expirations";

export const secret = process.env.JWT_SECRET || "todo-secrets";

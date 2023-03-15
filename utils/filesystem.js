import crypto from "crypto";
import config from "./config";

const CRYPTO_ALGORITHM = config.CRYPTO_ALGORITHM;
const IV_LENGTH = config.IV_LENGTH;

function hash(data) {
    return crypto.createHash("sha256").update(data).digest();
}

function createCredentials(password) {
    let tmp = hash(password);
    const iv = tmp.slice(0, 16);
    tmp = hash(tmp);
    const key = tmp.slice(8);
    return [key, iv];
}

export function encrypt(data, password) {
    data = Buffer.from(data, "utf-8").toString("hex");
    const [key, iv] = createCredentials(password);
    const cipher = crypto.createCipheriv(CRYPTO_ALGORITHM, key, iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
}

export function decrypt(data, password) {
    const [key, iv] = createCredentials(password);
    const decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM, key, iv);
    const hex = Buffer.concat([
        decipher.update(data),
        decipher.final()
    ]).toString("utf-8");
    return Buffer.from(hex, "hex").toString("utf-8");
}

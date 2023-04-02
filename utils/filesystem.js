import crypto from "crypto";
import config from "./config";

export function encrypt(data, password) {
    const iv = crypto.randomBytes(16);
    const key = crypto
        .createHash("sha256")
        .update(password)
        .digest("base64")
        .substr(0, 32);
    const cipher = crypto.createCipheriv(config.CRYPTO_ALGORITHM, key, iv);
    let encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(data, password) {
    const textParts = data.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedData = Buffer.from(textParts.join(":"), "hex");
    const key = crypto
        .createHash("sha256")
        .update(password)
        .digest("base64")
        .substr(0, 32);
    const decipher = crypto.createDecipheriv(config.CRYPTO_ALGORITHM, key, iv);
    const decryptedText = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
    return decryptedText.toString();
}

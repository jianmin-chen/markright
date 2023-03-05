import crypto from "crypto";
import config from "../../utils/config";

const algorithm = config.CRYPTO_ALGORITHM;

// const key = crypto.scryptSync(secret, "salt", 24);
const encrypt = (content, key) =>
    new Promise((resolve, reject) => {
        const iv = crypto.randomBytes(16);
    });

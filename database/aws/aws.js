// TODO: Rewrite for new version of AWS
import config from "../../utils/config";
import AWS from "aws-sdk";
import { decrypt, encrypt } from "../../utils/filesystem";

const S3 = new AWS.S3({
    endpoint: new AWS.Endpoint(config.R2_ENDPOINT),
    accessKeyId: config.R2_ID,
    secretAccessKey: config.R2_SECRET
});

export async function get(filename) {
    const params = {
        Bucket: config.R2_BUCKET,
        Key: filename
    };

    // Get content from AWS
    return new Promise((resolve, reject) => {
        S3.getObject(params, (err, data) => {
            if (err) return reject(err);
            if (data) return resolve(data.Body.toString());
            return "";
        });
    });
}

export async function exists(filename) {
    const params = {
        Bucket: config.R2_BUCKET,
        Key: filename
    };

    return new Promise((resolve, reject) => {
        S3.headObject(params, (err, data) => {
            if (err && err.name === "NotFound") return resolve(false);
            else if (err) return reject(err);
            return resolve(true);
        });
    });
}

export async function upload(filename, data = "") {
    const params = {
        Bucket: config.R2_BUCKET,
        Key: filename,
        Body: data
    };

    // Upload files to AWS
    return new Promise((resolve, reject) => {
        S3.upload(params, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export async function crypt(filename, type, password) {
    let content = await get(filename);
    if (!content.length) return "";
    return await upload(
        filename,
        type === "encrypt"
            ? encrypt(content, password)
            : decrypt(content, password)
    );
}

export async function del(filename) {
    const params = {
        Bucket: config.R2_BUCKET,
        Key: filename
    };

    return new Promise((resolve, reject) => {
        S3.deleteObject(params, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

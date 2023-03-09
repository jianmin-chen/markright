import config from "../../utils/config";
import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

const S3 = new AWS.S3({
    endpoint: new AWS.Endpoint(config.AWS_ENDPOINT),
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET
});

export async function get(filename) {
    const params = {
        Bucket: config.AWS_BUCKET,
        Key: filename
    };

    // Get content from AWS
    return new Promise((resolve, reject) => {
        S3.getObject(params, (err, data) => {
            if (err) return reject(err);
            return resolve(data.Body.toString());
        });
    });
}

export async function exists(filename) {
    const params = {
        Bucket: config.AWS_BUCKET,
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

export async function upload(filename, data) {
    const params = {
        Bucket: config.AWS_BUCKET,
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

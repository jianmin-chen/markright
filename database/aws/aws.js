const config = require("../../config");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const S3 = new AWS.S3({
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET
});

const content = async filename => {
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
};

const exists = async filename => {
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
};

const upload = async (filename, data) => {
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
};

module.exports = {
    content,
    exists,
    upload
};

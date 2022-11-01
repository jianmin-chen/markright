require("dotenv").config();

const AWS_BUCKET = process.env.AWS_BUCKET;
if (!AWS_BUCKET)
    throw new Error(
        "Please define the AWS_BUCKET environment variable inside .env"
    );

const AWS_ID = process.env.AWS_ID;
if (!AWS_ID)
    throw new Error(
        "Please define the AWS_ID environment variable inside .env"
    );

const AWS_SECRET = process.env.AWS_SECRET;
if (!AWS_SECRET)
    throw new Error(
        "Please define the AWS_SECRET environment variable inside .env"
    );

const COOKIE_NAME = process.env.COOKIE_NAME;
if (!COOKIE_NAME)
    throw new Error(
        "Please define the JWT_COOKIE environment variable inside .env"
    );

const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET)
    throw new Error(
        "Please define the COOKIE_SECRET environment variable inside .env"
    );

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error(
        "Please define the JWT_SECRET environment variable inside .env"
    );

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI)
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env"
    );

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV)
    throw new Error(
        "Please define the NODE_ENV environment variable inside .env"
    );

const PORT = process.env.PORT || 3000;
if (!PORT) throw new Error("Please define the PORT variable inside .env");

module.exports = {
    AWS_BUCKET,
    AWS_ID,
    AWS_SECRET,
    COOKIE_NAME,
    COOKIE_SECRET,
    JWT_SECRET,
    MONGODB_URI,
    NODE_ENV,
    PORT
};

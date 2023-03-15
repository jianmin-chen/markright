const AWS_ENDPOINT = process.env.AWS_ENDPOINT;
if (!AWS_ENDPOINT)
    throw new Error(
        "Please define the AWS_ENDPOINT environment variable inside .env"
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

const AWS_BUCKET = process.env.AWS_SECRET;
if (!AWS_BUCKET)
    throw new Error(
        "Please define the AWS_BUCKET environment variable inside .env"
    );

const CRYPTO_ALGORITHM = process.env.CRYPTO_ALGORITHM;
if (!CRYPTO_ALGORITHM)
    throw new Error(
        "Please define the CRYPTO_ALGORITHM environment variable inside .env"
    );

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID)
    throw new Error(
        "Please define the GOOGLE_CLIENT_ID environment variable inside .env"
    );

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_SECRET)
    throw new Error(
        "Please define the GOOGLE_CLIENT_SECRET environment variable inside .env"
    );

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI)
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env"
    );

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET)
    throw new Error(
        "Please define the NEXTAUTH_SECRET environment variable inside .env"
    );

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY)
    throw new Error(
        "Please define the UNSPLASH_ACCESS_KEY environment variable inside .env"
    );

const UNSPLASH_SECRET_KEY = process.env.UNSPLASH_SECRET_KEY;
if (!UNSPLASH_SECRET_KEY)
    throw new Error(
        "Please define the UNSPLASH_SECRET_KEY environment variable inside .env"
    );

export default {
    AWS_ENDPOINT,
    AWS_ID,
    AWS_SECRET,
    AWS_BUCKET,
    CRYPTO_ALGORITHM,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    MONGODB_URI,
    NEXTAUTH_SECRET,
    UNSPLASH_ACCESS_KEY,
    UNSPLASH_SECRET_KEY
};

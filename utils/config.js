const R2_ENDPOINT = process.env.R2_ENDPOINT;
if (!R2_ENDPOINT)
    throw new Error(
        "Please define the R2_ENDPOINT environment variable inside .env"
    );

const R2_ID = process.env.R2_ID;
if (!R2_ID)
    throw new Error("Please define the R2_ID environment variable inside .env");

const R2_SECRET = process.env.R2_SECRET;
if (!R2_SECRET)
    throw new Error(
        "Please define the R2_SECRET environment variable inside .env"
    );

const R2_BUCKET = process.env.R2_BUCKET;
if (!R2_BUCKET)
    throw new Error(
        "Please define the R2_BUCKET environment variable inside .env"
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

const GRAMMAR_USERNAME = process.env.GRAMMAR_USERNAME;
if (!GRAMMAR_USERNAME)
    throw new Error(
        "Please define the GRAMMAR_USERNAME environment variable inside .env"
    );

const GRAMMAR_PASSWORD = process.env.GRAMMAR_PASSWORD;
if (!GRAMMAR_PASSWORD)
    throw new Error(
        "Please define the GRAMMAR_PASSWORD environment variable inside .env"
    );

const IV_LENGTH = process.env.IV_LENGTH;
if (!IV_LENGTH)
    throw new Error(
        "Please define the IV_LENGTH environment variable inside .env"
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
    R2_ENDPOINT,
    R2_ID,
    R2_SECRET,
    R2_BUCKET,
    CRYPTO_ALGORITHM,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    IV_LENGTH: Number(IV_LENGTH),
    MONGODB_URI,
    NEXTAUTH_SECRET,
    UNSPLASH_ACCESS_KEY,
    UNSPLASH_SECRET_KEY
};

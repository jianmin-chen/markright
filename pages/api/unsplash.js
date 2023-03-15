import { getServerSession } from "next-auth/next";
import authOptions from "./auth/[...nextauth]";
import { createApi } from "unsplash-js";
import config from "../../utils/config";

const unsplash = createApi({
    accessKey: config.UNSPLASH_ACCESS_KEY
});

export default async function handler(req, res) {
    return res.status(404).json({ status: "In development" });

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user)
        return res.status(401).json({
            success: false,
            reason: "Not logged in"
        });

    const { method } = req;
    if (method !== "GET")
        return res.status(400).json({
            success: false,
            reason: "Invalid request method"
        });

    const { query } = req.query;
    if (!query)
        return res.status(400).json({
            success: false,
            reason: "Query not provided"
        });

    try {
        const results = await unsplash.search.getPhotos({
            query,
            orientation: "landscape"
        });
        if (results.type === "success")
            return res.status(200).json({
                success: true,
                results: results.response
            });
        throw new Error(results.response);
    } catch (err) {
        return res.status(500).json({
            success: false,
            reason: err
        });
    }
}

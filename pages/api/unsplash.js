import dbConnect from "../../database/connect";
import User from "../../database/services/user.service";
import config from "../../utils/config";
import authOptions from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { createApi } from "unsplash-js";

const unsplash = createApi({
    accessKey: config.UNSPLASH_ACCESS_KEY
});

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user)
        return res.status(401).json({
            success: false,
            reason: "Not logged in"
        });

    const { method } = req;

    if (method === "GET") {
        const { query, page } = req.query;
        if (!query)
            return res.status(400).json({
                success: false,
                reason: "Query not provided"
            });

        try {
            const results = await unsplash.search.getPhotos({
                query,
                orientation: "landscape",
                page: page || 1
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
    } else if (method === "POST") {
        const { data, type } = req.body;
        if (!data || ["file", "link"].includes(type))
            return res.status(400).json({
                success: false,
                reason: "Data or type not provided"
            });

        try {
            await dbConnect();
            const user = await User.findOne({ email: session.user.email });
            await user.setBackground(data);
            return res.status(200).json({
                success: true,
                user
            });
        } catch (err) {
            return res.status(500).json({ success: false, reason: err });
        }
    } else
        return res.status(400).json({
            success: false,
            reason: "Invalid request method"
        });
}

import dbConnect from "../../../database/connect";
import User from "../../../database/services/user.service";
import authOptions from "../auth/[...nextauth]";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    const token = await getToken({ req });
    if (!session || !session.user || !token)
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

    const { location } = req.query;
    if (!location || !location.length)
        return res.status(400).json({
            success: false,
            reason: "Location not provided"
        });

    try {
        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        return res.status(200).json({
            success: true,
            file: await user.getFile(location, token.sub)
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            reason: err.message
        });
    }
}

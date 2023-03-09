import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";
import dbConnect from "../../../database/connect";
import User from "../../../database/services/user.service";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user)
        return res.status(401).json({
            success: false,
            reason: "Not logged in"
        });

    const { method } = req;
    if (method !== "POST")
        return res.status(400).json({
            success: false,
            reason: "Invalid request method"
        });

    const { location } = req.body;
    if (!location)
        return res.status(400).json({
            success: false,
            reason: "Location not provided"
        });

    try {
        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        await user.addFile(location);
        return res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            reason: err.message
        });
    }
}
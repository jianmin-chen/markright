import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import authOptions from "../auth/[...nextauth]";
import dbConnect from "../../../database/connect";
import User from "../../../database/services/user.service";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    const token = await getToken({ req });
    if (!session || !session.user || !token)
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

    const { location, content } = req.body;
    if (!content) return res.status(200).json({ success: true }); // Empty
    if (!location || !location.length)
        return res.status(400).json({
            success: false,
            reason: "Location or content not provided"
        });

    try {
        await dbConnect();
        const user = await User.findOne({
            email: session.user.email
        });
        await user.updateFile(location, content, token.sub);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            reason: err.message
        });
    }
}

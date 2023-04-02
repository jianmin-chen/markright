import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import authOptions from "../auth/[...nextauth]";
import dbConnect from "../../../database/connect";
import User from "../../../database/services/user.service";
import { encrypt, decrypt } from "../../../utils/filesystem";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    const token = await getToken({ req });
    if (!session || !session.user || !token)
        return res.status(401).json({
            success: false,
            reason: "Not logged in"
        });

    const { method } = req;
    if (method === "POST") {
        const { location } = req.body;
        if (!location)
            return res.status(400).json({
                success: false,
                reason: "Location not provided"
            });

        try {
            await dbConnect();
            const user = await User.findOne({ email: session.user.email });
            await user.addFolder(location, token.sub);
            return res.status(200).json({
                success: true,
                filesystem: user.decryptObj(user.filesystem, token.sub)
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                reason: err.message
            });
        }
    } else
        return res.status(400).json({
            success: false,
            reason: "Invalid request method"
        });
}

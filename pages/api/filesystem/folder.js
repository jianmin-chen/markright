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
            const run = await user.addFolder(location);
            if (run.success)
                return res.status(200).json({
                    success: true,
                    user
                });
            else
                return res.status(200).json({
                    success: false,
                    reason: run.reason
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

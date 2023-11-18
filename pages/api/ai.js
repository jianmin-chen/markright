import connect from "../../utils/openai";
import authOptions from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export default async function handler(req, res) {
    return res.status(404);
    if (res.status !== 200)
        return res.status(429).json({
            success: false,
            reason: "Too many requests. Try again later."
        });

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

    const { query } = req.body;
    if (!query)
        return res.status(401).json({
            success: false,
            reason: "Query not provided"
        });

    try {
        const openai = await connect();
        return res.status(200).json({
            success: true,
            response: await openai.createCompletion({
                model: "text-davinci-003",
                prompt: query,
                temperature: 0.6
            }).data.choices[0].text
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            reason: err
        });
    }
}

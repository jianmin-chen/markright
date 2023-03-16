import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import config from "../../../utils/config";
import dbConnect from "../../../database/connect";
import User from "../../../database/services/user.service";

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ user }) {
            await dbConnect();
            if (!(await User.findOne({ email: user.email })))
                await User.create({ email: user.email });
            return true;
        },
        async session({ session, token }) {
            await dbConnect();
            if (session)
                return {
                    ...session,
                    user: {
                        ...session.user,
                        _id: String(
                            (await User.findOne({ email: session.user.email }))
                                ._id
                        )
                    }
                };
        }
    }
});

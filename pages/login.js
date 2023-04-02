import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]";
import { Button } from "../components/ui/Button";

export default function Login() {
    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm">
            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Button variant="outline" onClick={() => signIn("google")}>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const session = await getServerSession(req, res, authOptions);
    if (session) return { redirect: { destination: "/app" } };
    return { props: {} };
}

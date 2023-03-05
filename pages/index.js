import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]";
import { Button } from "../components/ui/Button";

export default function Login() {
    return (
        <div className="flex flex-col w-full h-screen justify-center items-center">
            <Button variant="outline" onClick={() => signIn("google")}>
                Sign in with Google
            </Button>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const session = await getServerSession(req, res, authOptions);
    if (session) return { redirect: { destination: "/app" } };
    return { props: {} };
}

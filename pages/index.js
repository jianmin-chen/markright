import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]";
import { ExternalLink } from "lucide-react";

export default function Login() {
    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm">
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-y-6 py-14">
                <div className="prose prose-xl">
                    <h1 className="!mb-0">Markright</h1>
                    <p>
                        A full-fledged Markdown editor with a filesystem and
                        OAuth login, written using a{" "}
                        <a
                            href="https://github.com/jianmin-chen/markdown-parser"
                            target="_blank">
                            custom Markdown parser
                        </a>
                        !{" "}
                        <button onClick={() => signIn("google")}>
                            <a>
                                Sign in with Google{" "}
                                <ExternalLink className="inline -rotate-2" />
                            </a>
                        </button>
                    </p>
                    <div className="flex w-full gap-x-2">
                        <video className="rounded-lg" autoPlay muted loop>
                            <source src="/images/demo.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const session = await getServerSession(req, res, authOptions);
    if (session) return { redirect: { destination: "/app" } };
    return { props: {} };
}

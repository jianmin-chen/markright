import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, use } from "react";
import dynamic from "next/dynamic";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import Menu from "../components/Menu";
import Outline from "../components/Outline";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import Files from "../components/Files/Files";
import dbConnect from "../database/connect";
import User from "../database/services/user.service";
import { downloadMarkdown, downloadHTML } from "../utils/markdownUtils";
import { useRouter } from "next/router";
import { getToken } from "next-auth/jwt";

const Workspace = dynamic(() => import("../components/Workspace"), {
    ssr: false
});

export default function Index({ files, background }) {
    const session = useSession();
    const router = useRouter();

    const docRef = useRef(null);
    const [value, setValue] = useState("");

    const [showSidebar, setShowSidebar] = useState(true);

    // Editor themes
    const [keyboardHandler, setKeyboardHandler] = useState("vim");
    const [aceTheme, setAceTheme] = useState("github");

    useEffect(() => {
        document.querySelectorAll(".prose pre").forEach(el => {
            if (!el.querySelector("span")) hljs.highlightElement(el);
        });
    }, [value]);

    useEffect(() => {
        if (session.status === "unauthenticated") return router.push("/login");
    }, []);

    return (
        <div
            className={`flex max-h-screen min-h-screen flex-col overflow-hidden`}
            style={{
                backgroundImage: `url("${background}")`,
                backgroundSize: "cover"
            }}>
            <div>
                <Menu
                    sidebar={{
                        sidebar: showSidebar,
                        showSidebar: setShowSidebar
                    }}
                    downloads={{
                        downloadMarkdown: () => downloadMarkdown(value),
                        downloadHTML: () => downloadHTML(value)
                    }}
                    keyboardHandler={{ keyboardHandler, setKeyboardHandler }}
                />
            </div>
            <div className="m-2 grid h-full flex-1 grid-cols-24 overflow-hidden rounded-md bg-white shadow-md">
                {showSidebar === true && (
                    <div className="col-span-4 flex h-full flex-col overflow-auto border-r bg-neutral-100">
                        <Tabs defaultValue="files">
                            <TabsList className="sticky top-0 mx-auto w-full flex-1 rounded-none bg-gray-200 p-0">
                                <TabsTrigger
                                    className="w-full rounded-none !shadow-none data-[state=active]:bg-neutral-100"
                                    value="files">
                                    Files
                                </TabsTrigger>
                                <TabsTrigger
                                    className="w-full rounded-none !shadow-none data-[state=active]:bg-neutral-100"
                                    value="outline">
                                    Outline
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                className="flex flex-col gap-y-4 border-none p-0"
                                value="files">
                                <Files
                                    initialFiles={files}
                                    openFile={() => {}}
                                />
                            </TabsContent>
                            <TabsContent
                                className="border-none"
                                value="outline">
                                <Outline
                                    value={value}
                                    onClick={line => {
                                        // Scroll to heading
                                        if (docRef.current) {
                                            let editor = docRef.current.editor;
                                            if (editor) editor.gotoLine(line);
                                        }
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
                <div
                    className={`${
                        showSidebar ? "col-span-20" : "col-span-24"
                    } h-full overflow-hidden`}>
                    <div className="h-full border-r">
                        <Workspace
                            value={value}
                            setValue={setValue}
                            keyboardHandler={keyboardHandler}
                            aceTheme={aceTheme}
                            docRef={docRef}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const session = await getServerSession(req, res);
    const token = await getToken({ req });
    if (!session || !token) return { redirect: { destination: "/login" } };

    // Get files
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });

    return {
        props: {
            files: user.decryptObj(user.filesystem, token.sub, { safe: true }),
            background: user.background
        }
    };
}

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, use } from "react";
import dynamic from "next/dynamic";
import "highlight.js/styles/default.css";
import Menu from "../components/Menu";
import Outline from "../components/Outline";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../components/ui/Tabs";
import Files from "../components/files/Files";
import dbConnect from "../database/connect";
import User from "../database/services/user.service";
import { downloadMarkdown, downloadHTML } from "../utils/markdownUtils";
import { useRouter } from "next/router";
import { getToken } from "next-auth/jwt";
import Notes from "../components/Notes";

const Workspace = dynamic(() => import("../components/Workspace"), {
    ssr: false
});

export default function Index({
    files: initialFiles,
    background: initialBackground,
    userId
}) {
    const session = useSession();
    const router = useRouter();

    const [background, setBackground] = useState(initialBackground);

    const [value, setValue] = useState("");

    const [message, setMessage] = useState("");

    const [showSidebar, setShowSidebar] = useState(true);

    // Editor themes
    const [keyboardHandler, setKeyboardHandler] = useState(null);
    const [aceTheme, setAceTheme] = useState("github");

    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const [activeLeft, setActiveLeft] = useState(null);
    const [activeRight, setActiveRight] = useState(null);

    const addLeft = (obj, setActive = true) => {
        // Determine if already in tabs; if so, focus on that tab
        const index = left.findIndex(f => f.filename === obj.filename);
        if (index >= 0) {
            setActiveLeft(index);
            return;
        }

        const length = left.length;
        setLeft([...left, obj]);
        if (setActive) setActiveLeft(length);
    };
    const addRight = (obj, setActive = true) => {
        const index = right.findIndex(f => f.filename === obj.filename);
        if (index >= 0) {
            setActiveRight(index);
            return;
        }

        const length = right.length;
        setRight([...right, obj]);
        if (setActive) setActiveRight(length);
    };

    const [files, setFiles] = useState(initialFiles);

    useEffect(() => {
        if (session.status === "unauthenticated") return router.push("/");
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
                    setBackground={setBackground}
                    sidebar={{
                        sidebar: showSidebar,
                        showSidebar: setShowSidebar
                    }}
                    downloads={{
                        downloadMarkdown: () => downloadMarkdown(value),
                        downloadHTML: () => downloadHTML(value)
                    }}
                    keyboardHandler={{ keyboardHandler, setKeyboardHandler }}
                    message={message}
                />
            </div>
            <div className="m-2 grid h-full flex-1 grid-cols-24 overflow-hidden rounded-md bg-white shadow-md">
                {showSidebar === true && (
                    <div className="col-span-8 flex h-full flex-col overflow-auto border-r bg-neutral-100 md:col-span-4">
                        <Tabs defaultValue="files">
                            <TabsList className="sticky top-0 mx-auto w-full flex-1 rounded-none border-b bg-gray-200 p-0">
                                <TabsTrigger
                                    className="w-full rounded-none !shadow-none data-[state=active]:bg-neutral-100"
                                    value="files">
                                    Files
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                className="flex flex-col gap-y-4 border-none p-0"
                                value="files">
                                <Files
                                    files={files}
                                    setFiles={setFiles}
                                    openFile={(filename, location) => {
                                        addLeft({
                                            filename,
                                            location,
                                            type: "input"
                                        });
                                        addRight({
                                            filename,
                                            location,
                                            type: "output"
                                        });
                                    }}
                                    userId={userId}
                                    setLeft={setLeft}
                                    setRight={setRight}
                                    left={left}
                                    right={right}
                                    activeLeft={activeLeft}
                                    activeRight={activeRight}
                                    setActiveLeft={setActiveLeft}
                                    setActiveRight={setActiveRight}
                                />
                            </TabsContent>
                            {/*
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
                                */}
                        </Tabs>
                    </div>
                )}
                <div
                    className={`${
                        showSidebar
                            ? "col-span-16 md:col-span-20"
                            : "col-span-24 md:col-span-24"
                    } h-full overflow-hidden`}>
                    <div className="h-full border-r">
                        <Workspace
                            setValue={setValue}
                            keyboardHandler={keyboardHandler}
                            aceTheme={aceTheme}
                            left={left}
                            right={right}
                            setLeft={setLeft}
                            setRight={setRight}
                            activeLeft={activeLeft}
                            activeRight={activeRight}
                            setActiveLeft={setActiveLeft}
                            setActiveRight={setActiveRight}
                            aceOptions={{ keyboardHandler, theme: aceTheme }}
                            setMessage={setMessage}
                            leftRef={leftRef}
                            rightRef={rightRef}
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
    if (!session || !token) return { redirect: { destination: "/" } };

    // Get files
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });

    return {
        props: {
            files: user.decryptObj(user.filesystem, token.sub, { safe: true }),
            background: user.background,
            userId: user._id.toString()
        }
    };
}

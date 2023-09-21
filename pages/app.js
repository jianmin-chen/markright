import Menu from "../components/Menu";
import Notes from "../components/Notes";
import Outline from "../components/Outline";
import PreferencesContext from "../components/PreferencesContext";
import Files from "../components/files/Files";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../components/ui/Tabs";
import dbConnect from "../database/connect";
import User from "../database/services/user.service";
import { post } from "../utils/fetch";
import { downloadMarkdown, downloadHTML } from "../utils/markdownUtils";
import "highlight.js/styles/default.css";
import "highlight.js/styles/github-dark.css";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

const Workspace = dynamic(() => import("../components/Workspace"), {
    ssr: false
});

export default function Index({
    files: initialFiles,
    background: initialBackground,
    preferences: {
        theme: initialTheme = "light",
        keyboardHandler: initialKeyboardHandler = "none"
    },
    userId
}) {
    const session = useSession();
    const router = useRouter();

    const [background, setBackground] = useState(initialBackground);
    const [theme, setTheme] = useState(initialTheme);

    const [value, setValue] = useState("");

    const [message, setMessage] = useState("");

    const [showSidebar, setShowSidebar] = useState(true);

    // Editor themes
    const [keyboardHandler, setKeyboardHandler] = useState(
        initialKeyboardHandler
    );

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
        document
            .querySelector("html")
            .classList.remove(theme === "light" ? "dark" : "light");
        document.querySelector("html").classList.add(theme);
        post({
            route: "/api/preferences",
            data: { preferences: { theme, keyboardHandler } }
        });
    }, [theme, keyboardHandler]);

    useEffect(() => {
        if (session.status === "unauthenticated") return router.push("/");
        document.querySelector("html").classList.add(theme);
    }, []);

    return (
        <PreferencesContext.Provider
            value={{ theme, setTheme, keyboardHandler, setKeyboardHandler }}>
            <div
                className={`flex max-h-screen min-h-screen flex-col overflow-hidden`}
                style={{
                    backgroundImage: `url("${background}")`,
                    backgroundSize: "cover"
                }}>
                <img src={background} className="hidden" />
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
                        keyboardHandler={{
                            keyboardHandler,
                            setKeyboardHandler
                        }}
                        message={message}
                    />
                </div>
                <div className="m-2 grid h-full flex-1 grid-cols-24 overflow-hidden rounded-md bg-white shadow-md dark:bg-neutral-900">
                    <div
                        className={`${
                            !showSidebar && "hidden"
                        } col-span-8 flex h-full flex-col overflow-auto border-r bg-neutral-100 dark:border-r dark:border-r-neutral-700 dark:bg-neutral-900 dark:text-gray-300 md:col-span-4`}>
                        <Tabs defaultValue="files">
                            <TabsList className="sticky top-0 z-[1] mx-auto w-full flex-1 rounded-none border-b bg-gray-200 p-0 dark:border-b-neutral-700">
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
                    <div
                        className={`${
                            showSidebar
                                ? "col-span-16 md:col-span-20"
                                : "col-span-24 md:col-span-24"
                        } h-full overflow-hidden`}>
                        <div className="h-full">
                            <Workspace
                                setValue={setValue}
                                keyboardHandler={keyboardHandler}
                                left={left}
                                right={right}
                                setLeft={setLeft}
                                setRight={setRight}
                                activeLeft={activeLeft}
                                activeRight={activeRight}
                                setActiveLeft={setActiveLeft}
                                setActiveRight={setActiveRight}
                                aceOptions={{
                                    keyboardHandler
                                }}
                                setMessage={setMessage}
                                leftRef={leftRef}
                                rightRef={rightRef}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PreferencesContext.Provider>
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
            preferences: user.editorSettings,
            userId: user._id.toString()
        }
    };
}

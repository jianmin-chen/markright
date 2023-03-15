import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import parseMarkdown from "../utils/parser";
import { useEffect, useState, useRef } from "react";
import { IBM_Plex_Mono, Inter } from "next/font/google";
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
import { useResizeDetector } from "react-resize-detector";
import { downloadMarkdown, downloadHTML } from "../utils/markdownUtils";
import { useRouter } from "next/router";

const AceEditor = dynamic(() => import("../components/AceEditor"), {
    ssr: false
});

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

const ibmPlexMono = IBM_Plex_Mono({
    weight: "400",
    subsets: ["latin"]
});

export function App({ files }) {
    const session = useSession();
    const router = useRouter();

    if (session && session.status === "unauthenticated")
        return router.push("/");

    const input = useRef(null);
    const output = useRef(null);
    const [scroll, setScroll] = useState("");

    const [showSidebar, setShowSidebar] = useState(true);
    const { width, height, ref } = useResizeDetector();

    const [keyboardHandler, setKeyboardHandler] = useState("vim");
    const [aceTheme, setAceTheme] = useState("github");

    const [value, setValue] = useState("");
    useEffect(() => {
        if (document)
            document.querySelectorAll(".prose pre").forEach(el => {
                if (!el.querySelector("span")) hljs.highlightElement(el);
            });
    }, [value]);

    return (
        <div className="flex max-h-screen min-h-screen flex-col overflow-hidden bg-[url(https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80)]">
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
                    <div className="col-span-4 border-r bg-neutral-100">
                        <Tabs defaultValue="files">
                            <TabsList className="mx-auto w-full rounded-none bg-gray-200 p-0">
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
                                        if (input.current) {
                                            let editor = input.current.editor;
                                            editor.gotoLine(line);
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
                    <div className="grid h-full w-full grid-cols-2 overflow-hidden">
                        <div className="h-full border-r">
                            <Tabs
                                className="flex h-full flex-col"
                                defaultValue="1"></Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Index({ files }) {
    const session = useSession();
    const [value, setValue] = useState("");
    const [outputScroll, setOutputScroll] = useState(false);
    const input = useRef(null);
    const output = useRef(null);

    const [showSidebar, setShowSidebar] = useState(true);
    const { width, height, ref } = useResizeDetector();

    // Editor themes
    const [keyboardHandler, setKeyboardHandler] = useState("vim");
    const [aceTheme, setAceTheme] = useState("github");

    useEffect(() => {
        document.querySelectorAll(".prose pre").forEach(el => {
            if (!el.querySelector("span")) hljs.highlightElement(el);
        });
    }, [value]);

    return (
        <div className="flex max-h-screen min-h-screen flex-col overflow-hidden bg-[url(https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80)]">
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
                    <div className="col-span-4 border-r bg-neutral-100">
                        <Tabs defaultValue="files">
                            <TabsList className="mx-auto w-full rounded-none bg-gray-200 p-0">
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
                                        if (input.current) {
                                            let editor = input.current.editor;
                                            editor.gotoLine(line + 1);
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
                    <div className="grid h-full w-full grid-cols-2 overflow-hidden">
                        <div className="h-full border-r">
                            <Tabs
                                className="flex h-full flex-col"
                                defaultValue="1">
                                <TabsList className="mx-auto w-full rounded-none bg-neutral-100 p-0">
                                    <TabsTrigger
                                        className="flex w-full rounded-none !shadow-none data-[state=active]:bg-white"
                                        value="0">
                                        <span className="flex-1 truncate">
                                            Files
                                        </span>
                                        <span>&times;</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="flex w-full rounded-none !shadow-none data-[state=active]:bg-white"
                                        value="1">
                                        <span className="flex-1 truncate">
                                            Here's how I rebuilt my Markdown
                                            parser
                                        </span>
                                        <span>&times;</span>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    className="border-none"
                                    value="0"></TabsContent>
                                <TabsContent
                                    className="h-full flex-1 overflow-auto border-none p-0"
                                    value="1"
                                    ref={ref}>
                                    <AceEditor
                                        options={{
                                            keyboardHandler,
                                            theme: aceTheme
                                        }}
                                        value={value}
                                        setValue={setValue}
                                        assignRef={input}
                                        onScroll={(scrollTop, height) => {
                                            if (!outputScroll) {
                                                let outputDiv = output.current;
                                                if (outputDiv) {
                                                    let scrollProportion =
                                                        scrollTop / height;
                                                    if (scrollProportion < 0)
                                                        scrollProportion = 0; // Clamp
                                                    outputDiv.scrollTop =
                                                        outputDiv.scrollHeight *
                                                        scrollProportion;

                                                    if (
                                                        scrollTop +
                                                            outputDiv.offsetHeight ===
                                                        height
                                                    )
                                                        outputDiv.scrollTop =
                                                            outputDiv.scrollHeight;
                                                }
                                            }
                                        }}
                                        width={width}
                                        height={height}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="h-full max-h-full overflow-hidden">
                            <Tabs
                                className="flex max-h-full flex-col overflow-hidden"
                                defaultValue="1">
                                <TabsList className="mx-auto w-full rounded-none bg-neutral-100 p-0">
                                    <TabsTrigger
                                        className="flex w-full rounded-none !shadow-none data-[state=active]:bg-white"
                                        value="0">
                                        <span className="flex-1 truncate">
                                            Files
                                        </span>
                                        <span>&times;</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="flex w-full rounded-none !shadow-none data-[state=active]:bg-white"
                                        value="1">
                                        <span className="flex-1 truncate">
                                            Here's how I rebuilt my Markdown
                                            parser
                                        </span>
                                        <span>&times;</span>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    className="border-none"
                                    value="0"></TabsContent>
                                <TabsContent
                                    className="h-full flex-1 overflow-auto border-none p-0"
                                    id="output"
                                    ref={output}
                                    onMouseEnter={() => setOutputScroll(true)}
                                    onMouseLeave={() => setOutputScroll(false)}
                                    onScroll={event => {
                                        if (outputScroll && input.current) {
                                            let editor = input.current.editor;
                                            if (event.target.scrollTop === 0)
                                                editor.session.setScrollTop(
                                                    -32
                                                );
                                            // Account for padding
                                            else {
                                                const scrollTop =
                                                    event.target.scrollTop;
                                                const height =
                                                    event.target.scrollHeight;
                                                let scrollProportion =
                                                    scrollTop / height;
                                                editor.session.setScrollTop(
                                                    editor.renderer.layerConfig
                                                        .maxHeight *
                                                        scrollProportion
                                                );
                                            }
                                        }
                                    }}
                                    value="1">
                                    <style jsx global>{`
                                        .prose > div h1:first-child,
                                        .prose > div h2:first-child,
                                        .prose > div h3:first-child,
                                        .prose > div h4:first-child,
                                        .prose > div h5:first-child,
                                        .prose > div h6:first-child {
                                            margin-top: 1.33rem !important;
                                        }
                                    `}</style>
                                    <div
                                        className={`prose prose-lg max-w-none px-8 pb-3 ${inter.className}`}
                                        dangerouslySetInnerHTML={{
                                            __html: parseMarkdown(value)
                                        }}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const session = await getServerSession(req, res);
    if (!session) return { redirect: { destination: "/" } };

    // Get files
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });

    return {
        props: {
            files: user.filesystem
        }
    };
}

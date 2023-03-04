import parseMarkdown from "../utils/parser";
import { useEffect, useState, useRef } from "react";
import { IBM_Plex_Serif, IBM_Plex_Mono, Inter } from "next/font/google";
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
import Files from "../components/Files";

const AceEditor = dynamic(() => import("../components/AceEditor"), {
    ssr: false
});

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

const ibmPlexSerif = IBM_Plex_Serif({
    weight: ["400", "700"],
    subsets: ["latin"]
});

const ibmPlexMono = IBM_Plex_Mono({
    weight: "400",
    subsets: ["latin"]
});

export default function Index() {
    const [value, setValue] = useState("");
    const [outputScroll, setOutputScroll] = useState(false);
    const input = useRef(null);
    const output = useRef(null);

    const [editorOptions, setEditorOptions] = useState({
        keyboardHandler: "vim",
        theme: "github"
    });

    useEffect(() => {
        document.querySelectorAll(".prose pre").forEach(el => {
            if (!el.querySelector("span")) hljs.highlightElement(el);
        });
    }, [value]);

    return (
        <div className="bg-[url(https://images.unsplash.com/photo-1677856216846-596a3d6d869e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80)] flex flex-col min-h-screen max-h-screen overflow-hidden">
            <div className="border-b">
                <Menu />
            </div>
            <div className=" bg-white flex-1 grid grid-cols-24 overflow-hidden h-full">
                <div className="bg-neutral-100 col-span-4 border-r">
                    <Tabs defaultValue="outline">
                        <TabsList className="bg-gray-200 mx-auto w-full rounded-none p-0">
                            <TabsTrigger
                                className="data-[state=active]:bg-neutral-100 w-full rounded-none !shadow-none"
                                value="files">
                                Files
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-neutral-100 w-full rounded-none !shadow-none"
                                value="outline">
                                Outline
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            className="border-none flex flex-col gap-y-4 p-0"
                            value="files">
                            <Files />
                        </TabsContent>
                        <TabsContent className="border-none" value="outline">
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
                <div className="col-span-20 h-full overflow-hidden">
                    <div className="grid grid-cols-2 w-full h-full overflow-hidden">
                        <div className="border-r h-full">
                            <Tabs
                                className="flex flex-col h-full"
                                defaultValue="1">
                                <TabsList className="bg-neutral-100 mx-auto w-full rounded-none p-0">
                                    <TabsTrigger
                                        className="flex data-[state=active]:bg-white w-full rounded-none !shadow-none"
                                        value="0">
                                        <span className="flex-1 truncate">
                                            Files
                                        </span>
                                        <span>&times;</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="flex data-[state=active]:bg-white w-full rounded-none !shadow-none"
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
                                    className="border-none flex-1 p-0 h-full overflow-auto"
                                    value="1">
                                    <AceEditor
                                        options={editorOptions}
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
                                                }
                                            }
                                        }}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="h-full max-h-full overflow-hidden">
                            <Tabs
                                className="flex flex-col max-h-full overflow-hidden"
                                defaultValue="1">
                                <TabsList className="bg-neutral-100 mx-auto w-full rounded-none p-0">
                                    <TabsTrigger
                                        className="flex data-[state=active]:bg-white w-full rounded-none !shadow-none"
                                        value="0">
                                        <span className="flex-1 truncate">
                                            Files
                                        </span>
                                        <span>&times;</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="flex data-[state=active]:bg-white w-full rounded-none !shadow-none"
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
                                    className="border-none flex-1 p-0 h-full overflow-auto"
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
                                        className={`prose prose-lg px-8 pb-3 max-w-none ${inter.className}`}
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

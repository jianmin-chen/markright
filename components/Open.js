import AceEditor from "./AceEditor";
import parseMarkdown from "../utils/parser";
import { useState, useEffect, useRef } from "react";
import { get, post } from "../utils/fetch";
import { useToast } from "../hooks/ui/useToast";
import { Inter } from "next/font/google";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "./ui/DropdownMenu";
import { Menu, Settings2 } from "lucide-react";
import { Button } from "./ui/Button";
import { downloadHTML, downloadMarkdown } from "../utils/markdownUtils";
import ReactToPrint from "react-to-print";
import Loader from "./Loader";
import {
    Menubar,
    MenubarLabel,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger
} from "./ui/Menubar";
import { useResizeDetector } from "react-resize-detector";

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

export default function Open({
    file,
    sizeRef,
    aceOptions,
    setMessage,
    setMirror,
    mirror,
    setSideValue,
    onScroll,
    scrollRef
}) {
    const menuSizeRef = useResizeDetector();
    const componentRef = useRef();
    const { toast } = useToast();
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        if (file.type === "output" && mirror !== null) setValue(mirror);
    }, [mirror]);

    useEffect(() => {
        get({
            route: "/api/file/content",
            data: { location: file.location }
        })
            .then(res => {
                setValue(res.file);
                setLoading(false);
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    }, [file]);

    const update = () => {
        post({
            route: "/api/file/update",
            data: { location: file.location, content: value }
        })
            .then(() => {
                setMessage("Saved");
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    useEffect(() => {
        // Autosave every 30 seconds
        if (file.type === "input") {
            setMessage("Saving...");
            setMirror(value);
            setSideValue(value);
            const timer = setTimeout(update, 5000);
            return () => {
                clearTimeout(timer);
                setMessage("");
            };
        }
    }, [value]);

    if (loading) return <Loader />;

    if (file.type === "input")
        return (
            <>
                <Menubar
                    className="sticky top-2 z-[99] m-2 space-x-0 p-2"
                    ref={menuSizeRef.ref}>
                    <MenubarMenu>
                        <MenubarTrigger className="pr-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                            Paragraph
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarLabel>Coming soon!</MenubarLabel>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="pr-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                            Format
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarLabel>Coming soon!</MenubarLabel>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="pr-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                            Plugins
                        </MenubarTrigger>
                        <MenubarContent>
                            <MenubarLabel>Coming soon!</MenubarLabel>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
                <div
                    onMouseEnter={() => setScroll(true)}
                    onMouseLeave={() => setScroll(false)}>
                    <AceEditor
                        value={value}
                        setValue={setValue}
                        onBlur={() => {
                            update();
                            setMessage("Saved");
                        }}
                        width={sizeRef.width}
                        height={sizeRef.height - menuSizeRef.height}
                        options={{
                            ...aceOptions
                        }}
                        scrollRef={scrollRef}
                        scroll={scroll}
                        onScroll={onScroll}
                    />
                </div>
            </>
        );

    return (
        <div
            className="h-full overflow-auto"
            onMouseEnter={() => setScroll(true)}
            onMouseLeave={() => setScroll(false)}
            onScroll={() => {
                if (scroll)
                    onScroll(
                        scrollRef.current.scrollTop,
                        scrollRef.current.scrollHeight
                    );
            }}
            ref={scrollRef}>
            <style jsx global>{`
                .prose > div h1:first-child {
                    margin-top: 3rem !important;
                }
            `}</style>
            <Menubar className="sticky top-2 m-2">
                <MenubarMenu>
                    <MenubarTrigger className="pr-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                        Download
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            onClick={() => downloadHTML(value, file.filename)}>
                            As HTML
                        </MenubarItem>
                        <MenubarItem
                            onClick={() =>
                                downloadMarkdown(value, file.filename)
                            }>
                            As Markdown
                        </MenubarItem>
                        <ReactToPrint
                            trigger={() => (
                                <MenubarItem>Print/Save as PDF</MenubarItem>
                            )}
                            content={() => componentRef.current}
                        />
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <div
                className={`prose prose-lg max-w-none px-8 pb-12 ${inter.className}`}
                dangerouslySetInnerHTML={{
                    __html: parseMarkdown(value)
                }}
                ref={componentRef}
            />
        </div>
    );
}

import { useToast } from "../hooks/ui/useToast";
import { get, post } from "../utils/fetch";
import { downloadHTML, downloadMarkdown } from "../utils/markdownUtils";
import parseMarkdown from "../utils/parser";
import AceEditor from "./AceEditor";
import Loader from "./Loader";
import { Button } from "./ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "./ui/DropdownMenu";
import {
    Menubar,
    MenubarLabel,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger
} from "./ui/Menubar";
import hljs from "highlight.js";
import { Menu, Settings2 } from "lucide-react";
import { Inter } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import ReactToPrint from "react-to-print";

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

export default function Open({
    file,
    sizeRef,
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

    const highlight = () => {
        document.querySelectorAll(".prose pre").forEach(el => {
            if (!el.querySelector("span")) hljs.highlightElement(el);
        });
    };

    useEffect(() => {
        if (file.type === "output" && mirror !== null) setValue(mirror);
    }, [mirror]);

    useEffect(() => {
        highlight();
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
        highlight();
        setSideValue(value);
        if (file.type === "input") {
            setMessage("Saving...");
            setMirror(value);
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
            <div
                className="dark:bg-neutral-900"
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
                    height={sizeRef.height}
                    scrollRef={scrollRef}
                    scroll={scroll}
                    onScroll={onScroll}
                />
            </div>
        );

    return (
        <div
            className="h-full overflow-auto dark:bg-neutral-900"
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
            <div
                className={`!dark:bg-neutral-900 prose prose-lg max-w-none px-8 dark:prose-invert ${inter.className}`}
                dangerouslySetInnerHTML={{
                    __html: parseMarkdown(value)
                }}
                ref={componentRef}
            />
        </div>
    );
}

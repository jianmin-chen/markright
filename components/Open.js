import AceEditor from "./AceEditor";
import parseMarkdown from "../utils/parser";
import { useState, useEffect, useRef } from "react";
import { get, post } from "../utils/fetch";
import { useToast } from "../hooks/ui/useToast";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "./ui/DropdownMenu";
import { Settings2 } from "lucide-react";
import { Button } from "./ui/Button";
import { downloadHTML, downloadMarkdown } from "../utils/markdownUtils";
import ReactToPrint from "react-to-print";

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

const ibmPlexMono = IBM_Plex_Mono({
    weight: "400",
    subsets: ["latin"]
});

export default function Open({
    file,
    sizeRef,
    aceOptions,
    setMessage,
    docRef,
    setMirror,
    mirror,
    setSideValue
}) {
    const componentRef = useRef();
    const { toast } = useToast();
    const [value, setValue] = useState("");

    useEffect(() => {
        if (file.type === "output" && mirror !== null) setValue(mirror);
    }, [mirror]);

    useEffect(() => {
        get({
            route: "/api/file/content",
            data: { location: file.location }
        })
            .then(res => setValue(res.file))
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

    if (file.type === "input")
        return (
            <AceEditor
                value={value}
                setValue={setValue}
                onScroll={() => {}}
                onBlur={() => {
                    update();
                    setMessage("Saved");
                }}
                width={sizeRef.width}
                height={sizeRef.height}
                options={{
                    ...aceOptions
                }}
                assignRef={docRef ? docRef : null}
            />
        );

    return (
        <div className="h-full overflow-auto">
            <style jsx global>{`
                .prose > div h1:first-child {
                    margin-top: 3rem !important;
                }
            `}</style>
            <div
                className={`prose prose-lg max-w-none px-8 pb-12 ${inter.className}`}
                dangerouslySetInnerHTML={{
                    __html: parseMarkdown(value)
                }}
                ref={componentRef}
            />
            <DropdownMenu>
                <DropdownMenuTrigger
                    className={`${
                        !value.length && "hidden"
                    } output-options-trigger absolute bottom-4 left-4`}>
                    <Button
                        variant="outline"
                        className="w-10 rounded-full bg-white p-0 shadow-md">
                        <Settings2 className="h-4 w-4" />
                        <span className="sr-only">Open popover</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="output-options-content">
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            Download
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={() =>
                                    downloadHTML(value, file.filename)
                                }>
                                As HTML
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    downloadMarkdown(value, file.filename)
                                }>
                                As Markdown
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <ReactToPrint
                        trigger={() => (
                            <DropdownMenuItem>
                                Print/Save as PDF
                            </DropdownMenuItem>
                        )}
                        content={() => componentRef.current}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

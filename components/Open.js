import AceEditor from "./AceEditor";
import parseMarkdown from "../utils/parser";
import { useState, useEffect } from "react";
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
    docRef
}) {
    const { toast } = useToast();
    const [value, setValue] = useState("");

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

    useEffect(() => {
        // Autosave every 30 seconds
        if (file.type === "input") {
            setMessage("Saving...");
            const timer = setTimeout(() => {
                post({
                    route: "/api/file/update",
                    data: { location: file.location, content: value }
                })
                    .then(() => setMessage("Saved"))
                    .catch(err =>
                        toast({
                            variant: "destructive",
                            title: "Uh oh! Something went wrong.",
                            description: err
                        })
                    );
            }, 5000);
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
                width={sizeRef.width}
                height={sizeRef.height}
                options={{
                    ...aceOptions
                }}
                assignRef={docRef ? docRef : null}
            />
        );

    return (
        <div className="relative">
            <style jsx global>{`
                .prose > div h1:first-child {
                    margin-top: 3rem !important;
                }
            `}</style>
            <div
                className={`prose prose-lg max-w-none px-8 pb-3 ${inter.className}`}
                dangerouslySetInnerHTML={{
                    __html: parseMarkdown(value)
                }}
            />
            <DropdownMenu>
                <DropdownMenuTrigger className="output-options-trigger sticky bottom-4 left-4">
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
                    <DropdownMenuItem onClick={() => window.print()}>
                        Print/Save as PDF
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

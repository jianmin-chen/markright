import AceEditor from "./AceEditor";
import parseMarkdown from "../utils/parser";
import { useState, useEffect } from "react";
import { get, post } from "../utils/fetch";
import { useToast } from "../hooks/ui/useToast";
import { IBM_Plex_Mono, Inter } from "next/font/google";

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
    setOutlineValue,
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
        if (file.type === "input" && value.length) {
            setMessage("Saving...");
            setOutlineValue(value);
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
        <div>
            <style jsx global>{`
                .prose > div h1:first-child,
                .prose > div h2:first-child,
                .prose > div h3:first-child,
                .prose > div h4:first-child,
                .prose > div h5:first-child,
                .prose > div h6:first-child {
                    margin-top: 1.5rem !important;
                }
            `}</style>
            <div
                className={`prose prose-lg max-w-none px-8 pb-3 ${inter.className}`}
                dangerouslySetInnerHTML={{
                    __html: parseMarkdown(value)
                }}
            />
        </div>
    );
}

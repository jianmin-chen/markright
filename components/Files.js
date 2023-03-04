import { FolderClosed, File as FileIcon, MoreVertical } from "lucide-react";
import { Button } from "./ui/Button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger
} from "./ui/ContextMenu";

const files = [
    {
        type: "folder",
        name: "Markright",
        content: [
            {
                type: "file",
                name: "Plans for new",
                active: true,
                content: ""
            },
            {
                type: "file",
                name: "TODO",
                content: ""
            }
        ]
    },
    {
        type: "folder",
        name: "College",
        content: [
            {
                type: "folder",
                name: "Essays",
                content: []
            }
        ]
    },
    {
        type: "content",
        name: "Project",
        content: ""
    }
];

function File({ name, content, active }) {
    return (
        <button
            className={`${
                active && "bg-neutral-200"
            } flex gap-x-1 items-center w-full px-4 py-1 rounded-l-md`}>
            <FileIcon className="w-4 h-4" />
            {name}
        </button>
    );
}

function Folder({ name, content }) {
    return (
        <>
            <button className="flex gap-x-1 items-center px-4">
                <FolderClosed className="w-4 h-4" />
                {name}
            </button>
            <div className="ml-2">
                {content.map((file, idx) => {
                    if (file.type === "folder") return <Folder {...file} />;
                    return <File {...file} />;
                })}
            </div>
        </>
    );
}

export default function Files() {
    return (
        <div className="flex flex-col gap-y-1 pl-3 py-3">
            {files.map((file, idx) => {
                if (file.type === "folder") return <Folder {...file} />;
                return <File {...file} />;
            })}
        </div>
    );
}

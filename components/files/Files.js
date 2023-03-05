import {
    FolderClosed,
    File as FileIcon,
    MoreVertical,
    MoreHorizontal,
    ChevronRight,
    ChevronDown,
    Plus,
    PlusCircle
} from "lucide-react";
import { Button } from "../ui/Button";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/DropdownMenu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import styles from "./Files.module.scss";
import { Input } from "../ui/Input";

function File({ name, content, active, className }) {
    return (
        <>
            <button
                className={`file w-full max-w-full hover:bg-neutral-200 rounded-md py-1 px-3 flex justify-between items-center ${styles.file} ${className} `}>
                <span className="flex gap-x-1 items-center">
                    <FileIcon className="w-4 h-4" />
                    <span className="truncate overflow-hidden">{name}</span>
                </span>
                <span className={`${styles.extra} flex items-center`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-neutral-300 px-1 py-0.5 rounded-md">
                            <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Make public</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </span>
            </button>
        </>
    );
}

function Folder({ name, content }) {
    const [toggle, setToggle] = useState(false);

    return (
        <>
            <button
                className={`w-full cursor-pointer folder hover:bg-neutral-200 rounded-md py-1 px-3 flex justify-between items-center ${styles.folder}`}
                onClick={() => setToggle(!toggle)}>
                <span className="flex gap-x-1 items-center">
                    {content.length > 0 &&
                        (toggle ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        ))}
                    <FolderClosed className="w-4 h-4" />
                    <span className="truncate">{name}</span>
                </span>
                <span className={`${styles.extra} flex`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="hover:bg-neutral-300 px-1 py-0.5 rounded-md">
                            <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Popover>
                        <PopoverTrigger
                            className="hover:bg-neutral-300 px-1 py-0.5 rounded-md"
                            onClick={event => event.stopPropagation()}>
                            <Plus className="w-4 h-4" />
                        </PopoverTrigger>
                        <PopoverContent
                            onClick={event => event.stopPropagation()}>
                            <Input placeholder="Name of file" />
                        </PopoverContent>
                    </Popover>
                </span>
            </button>
            {toggle === true && content.length > 0 && (
                <div className="pl-5 flex flex-col w-full">
                    {content.map((file, idx) => {
                        if (file.type === "folder") return <Folder {...file} />;
                        return <File {...file} />;
                    })}
                </div>
            )}
        </>
    );
}

export default function Files() {
    const [files, useFiles] = useState([]);

    return (
        <div className="flex flex-col py-7 px-2 items-center">
            <button className="file w-full max-w-full hover:bg-neutral-200 rounded-md py-1 px-3 flex gap-x-1 items-center">
                <PlusCircle className="h-4 w-4" /> Add a folder
            </button>
            {files.map((file, idx) => {
                if (file.type === "folder") return <Folder {...file} />;
                return <File {...file} className="px-4" />;
            })}
        </div>
    );
}

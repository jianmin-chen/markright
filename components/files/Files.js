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
    DialogTrigger,
    DialogFooter
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import styles from "./Files.module.scss";
import { Input } from "../ui/Input";
import { useToast } from "../../hooks/ui/useToast";
import { post } from "../../utils/fetch";
import catchError from "../../utils/logging";

function File({
    name,
    content,
    active,
    className,
    toast,
    location,
    updateFilesystem,
    openFile
}) {
    return (
        <>
            <button
                className={`file flex w-full max-w-full items-center justify-between rounded-md py-1 px-3 hover:bg-neutral-200 ${styles.file} ${className} `}>
                <span className="flex min-w-0 items-center gap-x-1">
                    <FileIcon className="h-4 w-4" />
                    <span className="truncate">{name}</span>
                </span>
                <span className={`${styles.extra} flex items-center`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md px-1 py-0.5 hover:bg-neutral-300">
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Make public</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Rename</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </span>
            </button>
        </>
    );
}

function Folder({
    name,
    content,
    toast,
    location,
    updateFilesystem,
    openFile
}) {
    const [toggle, setToggle] = useState(false);
    const [nameFile, setNameFile] = useState(false);

    const createFolder = event => {
        event.preventDefault();
        const folder = event.target.folder.value;
        if (!folder) {
        }
    };

    const createFile = file => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Make sure you fill out the name of the file!"
            });
            return;
        }
        post({
            route: "/api/filesystem/addFile",
            data: { location: `${location}/${file}` }
        }).then(json => {
            updateFilesystem(json.user.filesystem);
        });
    };

    return (
        <>
            <div
                className={`folder flex w-full cursor-pointer items-center justify-between rounded-md py-1 px-3 hover:bg-neutral-200 ${styles.folder}`}
                onClick={() => setToggle(!toggle)}>
                <span className="flex items-center gap-x-1">
                    {content.length > 0 &&
                        (toggle ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        ))}
                    <FolderClosed className="h-4 w-4" />
                    <span className="truncate">{name}</span>
                </span>
                <span className={`${styles.extra} flex`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md px-1 py-0.5 hover:bg-neutral-300">
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>New folder</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                        className="rounded-md px-1 py-0.5 hover:bg-neutral-300"
                        onClick={event => {
                            event.stopPropagation();
                            setNameFile(true);
                        }}>
                        <Plus className="h-4 w-4" />
                    </button>
                </span>
            </div>
            {nameFile === true && (
                <form
                    className={`flex w-full max-w-full items-center justify-between rounded-md border border-blue-500 py-1 px-3 pl-5 shadow-md`}
                    onSubmit={event => {
                        event.preventDefault();
                        createFile(event.target.file.value);
                        event.target.reset();
                        setNameFile(false);
                    }}>
                    <span className="flex min-w-0 items-center gap-x-1 ">
                        <FileIcon className="h-4 w-4" />
                        <input
                            className="max-w-full flex-1 bg-transparent"
                            autoComplete="off"
                            autoFocus={true}
                            name="file"
                            onBlur={event => {
                                if (!event.target.value.length) {
                                    setNameFile(false);
                                    return;
                                }
                                createFile(event.target.value);
                                event.target.value = "";
                                setNameFile(false);
                            }}
                            placeholder="Untitled"
                            required
                            title="New file"
                        />
                    </span>
                    <button
                        className="visibility-hidden"
                        type="submit"></button>
                </form>
            )}
            {toggle === true && content.length > 0 && (
                <div className="flex w-full flex-col pl-5">
                    {content.map((file, idx) => {
                        if (file.type === "folder")
                            return (
                                <Folder
                                    {...file}
                                    toast={toast}
                                    location={`${location}/${file.name}`}
                                />
                            );
                        return (
                            <File
                                {...file}
                                openFile={openFile}
                                toast={toast}
                                location={`${location}/${file.name}`}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default function Files({ initialFiles, openFile }) {
    const [files, setFiles] = useState(initialFiles);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    // Toggle new folder creation
    const [nameFolder, setNameFolder] = useState(false);

    const createFolder = folder => {
        if (!folder) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Make sure you fill out the name of the folder!"
            });
            return;
        } else if (folder.includes("/")) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "No slashes allowed in folder names. Try again?"
            });
        }

        post({
            route: "/api/filesystem/folder",
            data: { location: folder }
        })
            .then(json => {
                console.log(json);
                setFiles(json.filesystem);
                setOpen(false);
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="flex flex-col items-center py-7 px-2">
            <button
                className="file flex w-full max-w-full items-center gap-x-1 rounded-md py-1 px-3 hover:bg-neutral-200"
                onClick={() => setNameFolder(true)}>
                <PlusCircle className="h-4 w-4" /> Add a folder
            </button>
            {nameFolder === true && (
                <form
                    className={`flex w-full max-w-full items-center justify-between rounded-md border border-blue-500 py-1 px-3 pl-5 shadow-md`}
                    onSubmit={event => {
                        event.preventDefault();
                        createFolder(event.target.file.value);
                        event.target.reset();
                        setNameFolder(false);
                    }}>
                    <span className="flex min-w-0 items-center gap-x-1 ">
                        <FileIcon className="h-4 w-4" />
                        <input
                            className="max-w-full flex-1 bg-transparent"
                            autoComplete="off"
                            autoFocus={true}
                            name="file"
                            onBlur={event => {
                                if (!event.target.value.length) {
                                    setNameFolder(false);
                                    return;
                                }
                                createFolder(event.target.value);
                                event.target.value = "";
                                setNameFolder(false);
                            }}
                            placeholder="Untitled folder"
                            required
                            title="New folder"
                        />
                    </span>
                    <button
                        className="visibility-hidden"
                        type="submit"></button>
                </form>
            )}
            {files.map((file, idx) => {
                if (file.type === "folder")
                    return (
                        <Folder
                            key={`folder${file.name}`}
                            {...file}
                            toast={toast}
                            location={file.name}
                            updateFilesystem={setFiles}
                            openFile={openFile}
                        />
                    );
                return (
                    <File
                        {...file}
                        className="px-4"
                        key={`file${file.name}`}
                        toast={toast}
                        location={file.name}
                        updateFilesystem={setFiles}
                        openFile={openFile}
                    />
                );
            })}
        </div>
    );
}

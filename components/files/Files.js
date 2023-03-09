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
                className={`file w-full max-w-full hover:bg-neutral-200 rounded-md py-1 px-3 flex justify-between items-center ${styles.file} ${className} `}>
                <span className="min-w-0 flex gap-x-1 items-center">
                    <FileIcon className="w-4 h-4" />
                    <span className="truncate">{name}</span>
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
                            <DropdownMenuItem>New folder</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                        className="hover:bg-neutral-300 px-1 py-0.5 rounded-md"
                        onClick={event => {
                            event.stopPropagation();
                            setNameFile(true);
                        }}>
                        <Plus className="w-4 h-4" />
                    </button>
                </span>
            </div>
            {nameFile === true && (
                <form
                    className={`shadow-md border-blue-500 border pl-5 w-full max-w-full rounded-md py-1 px-3 flex justify-between items-center`}
                    onSubmit={event => {
                        event.preventDefault();
                        createFile(event.target.file.value);
                        event.target.reset();
                        setNameFile(false);
                    }}>
                    <span className="flex gap-x-1 items-center min-w-0 ">
                        <FileIcon className="w-4 h-4" />
                        <input
                            className="bg-transparent flex-1 max-w-full"
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
                <div className="pl-5 flex flex-col w-full">
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

    const createFolder = event => {
        event.preventDefault();
        const folder = event.target.folder.value;
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
            route: "/api/filesystem/addFolder",
            data: { location: folder }
        })
            .then(json => {
                setFiles(json.user.filesystem);
                setOpen(false);
            })
            .catch(err => catchError({ toast, err }));
    };

    return (
        <div className="flex flex-col py-7 px-2 items-center">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className="file w-full max-w-full hover:bg-neutral-200 rounded-md py-1 px-3 flex gap-x-1 items-center">
                    <PlusCircle className="h-4 w-4" /> Add a folder
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={createFolder}>
                        <DialogHeader>
                            <DialogTitle>New folder</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                autoComplete="off"
                                name="folder"
                                placeholder="Name of folder?"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create folder</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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

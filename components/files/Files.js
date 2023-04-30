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
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/DropdownMenu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import styles from "./Files.module.scss";
import { Input } from "../ui/Input";
import { useToast } from "../../hooks/ui/useToast";
import { del, get, post } from "../../utils/fetch";
import catchError from "../../utils/logging";

function File({
    name: initialName,
    content,
    active,
    className,
    toast,
    location: initialLocation,
    updateFilesystem,
    openFile,
    isPublic,
    userId,
    setFiles,
    left,
    right,
    activeLeft,
    activeRight,
    setLeft,
    setRight,
    setActiveLeft,
    setActiveRight
}) {
    const [name, setName] = useState(initialName);
    const [location, setLocation] = useState(initialLocation);
    const [rename, setRename] = useState(false);
    const [publicState, setPublicState] = useState(isPublic);

    const togglePublic = isPublic => {
        post({
            route: "/api/file/public",
            data: { location, isPublic }
        })
            .then(res => setPublicState(isPublic))
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    const renameFile = filename => {
        const traversed = location.split("/");
        setName(filename);
        setLocation(traversed.slice(0, traversed.length - 1) + "/" + filename);
        post({
            route: "/api/file/rename",
            data: {
                oldLocation:
                    traversed.slice(0, traversed.length - 1) + "/" + name,
                newLocation:
                    traversed.slice(0, traversed.length - 1) + "/" + filename
            }
        })
            .then(res => {
                setRename(false);
                setFiles(res.filesystem);
                // Update tabs
                const leftCopy = Array.from(left);
                const leftIndex = leftCopy.findIndex(
                    f => f.location === location
                );
                if (leftIndex !== -1)
                    leftCopy[leftIndex] = {
                        ...leftCopy[leftIndex],
                        filename,
                        location:
                            traversed.slice(0, traversed.length - 1) +
                            "/" +
                            filename
                    };
                setLeft(leftCopy);
                const rightCopy = Array.from(right);
                const rightIndex = rightCopy.findIndex(
                    f => f.location === location
                );
                if (rightIndex !== -1)
                    rightCopy[rightIndex] = {
                        ...rightCopy[rightIndex],
                        filename,
                        location:
                            traversed.slice(0, traversed.length - 1) +
                            "/" +
                            filename
                    };
                setRight(rightCopy);
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    const deleteSelf = () => {
        post({
            route: "/api/file/delete",
            data: { location }
        })
            .then(res => {
                setFiles(res.filesystem);
                // Update tabs
                const leftCopy = Array.from(left).filter(
                    f => f.location !== location
                );
                if (left[activeLeft])
                    if (leftCopy.length === 0) setActiveLeft(null);
                setLeft(leftCopy);
                const rightCopy = Array.from(right).filter(
                    f => f.location !== location
                );
                if (rightCopy.length === 0) setActiveRight(null);
                else if (rightCopy.length != right.length && rightActive !== 0)
                    setActiveRight(activeRight - 1);
                setRight(rightCopy);
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    return (
        <>
            <button
                className={`file flex w-full max-w-full items-center justify-between rounded-md py-1 px-3 ${
                    !rename && "hover:bg-neutral-200"
                } ${styles.file} ${className} `}
                onClick={() => {
                    if (!rename) openFile(name, location);
                }}
                title={name}>
                {rename ? (
                    <form
                        className="flex w-full max-w-full items-center justify-between rounded-md border border-blue-500 py-1 px-3 pl-5 shadow-md"
                        onSubmit={event => {
                            event.stopPropagation();
                            event.preventDefault();
                            if (
                                event.target.file.value.length &&
                                event.target.file.value !== name
                            ) {
                                renameFile(event.target.file.value);
                            }
                            event.target.reset();
                        }}>
                        <span className="flex min-w-0 max-w-full items-center gap-x-1 overflow-hidden">
                            <FileIcon className="h-4 w-4 shrink-0" />
                            <input
                                className="max-w-full flex-1 overflow-auto bg-transparent"
                                autoComplete="off"
                                autoFocus={true}
                                name="file"
                                onChange={event => event.stopPropagation()}
                                onBlur={event => {
                                    if (
                                        !event.target.value.length ||
                                        event.target.value === name
                                    ) {
                                        setRename(false);
                                        return;
                                    }
                                    event.target.value = "";
                                    renameFile(event.target.value);
                                    setRename(false);
                                }}
                                required
                                title="Rename file"
                                defaultValue={name}
                            />
                        </span>
                    </form>
                ) : (
                    <>
                        <span className="flex min-w-0 items-center gap-x-1">
                            <FileIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{name}</span>
                        </span>
                        <span className={`${styles.extra} flex items-center`}>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="rounded-md px-1 py-0.5 hover:bg-neutral-300">
                                    <MoreHorizontal className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={event => {
                                            event.stopPropagation();
                                            togglePublic(!publicState);
                                        }}>
                                        {publicState
                                            ? "Make private"
                                            : "Make public"}
                                    </DropdownMenuItem>
                                    {publicState === true && (
                                        <DropdownMenuItem
                                            onClick={event => {
                                                event.stopPropagation();
                                                get({
                                                    route: "/api/file/meta",
                                                    data: { location }
                                                })
                                                    .then(res => {
                                                        navigator.clipboard.writeText(
                                                            `https://markright.vercel.app/public/${userId}/${res.meta.storage.replace(
                                                                ".md",
                                                                ""
                                                            )}`
                                                        );
                                                        toast({
                                                            description:
                                                                "Copied to clipboard!"
                                                        });
                                                    })
                                                    .catch(err =>
                                                        toast({
                                                            variant:
                                                                "destructive",
                                                            title: "Uh oh! Something went wrong.",
                                                            description: err
                                                        })
                                                    );
                                            }}>
                                            Copy link
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={event => {
                                            event.stopPropagation();
                                            setRename(true);
                                        }}>
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-500"
                                        onClick={event => {
                                            event.stopPropagation();
                                            deleteSelf();
                                        }}>
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </span>
                    </>
                )}
            </button>
        </>
    );
}

function Folder({
    name: initialName,
    content,
    toast,
    location,
    updateFilesystem,
    openFile,
    setFiles,
    userId,
    left,
    right,
    setLeft,
    setRight,
    activeLeft,
    activeRight,
    setActiveLeft,
    setActiveRight
}) {
    const [name, setName] = useState(initialName);
    const [toggle, setToggle] = useState(false);
    const [renameFolder, setRenameFolder] = useState(false);
    const [nameFile, setNameFile] = useState(false);
    const [nameFolder, setNameFolder] = useState(false);

    const createFile = file => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Make sure you fill out the name of the file!"
            });
            return;
        } else if (file.includes("/")) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "No slashes allowed in file names. Try again!"
            });
        }

        post({
            route: "/api/file/create",
            data: { location: `${location}/${file}` }
        }).then(json => {
            setFiles(json.filesystem);
            setToggle(true);
        });
    };

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
            return;
        }

        post({
            route: "/api/folder/create",
            data: { location: `${location}/${folder}` }
        })
            .then(json => {
                setFiles(json.filesystem);
                setToggle(true);
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    const renameSelf = foldername => {
        const traversed = location.split("/");
        setName(foldername);
        const oldLocation =
            traversed.length === 1
                ? initialName
                : traversed.slice(0, traversed.length - 1) + "/" + initialName;
        const newLocation =
            traversed.length === 1
                ? foldername
                : traversed.slice(0, traversed.length - 1) + "/" + foldername;
        post({
            route: "/api/folder/rename",
            data: {
                oldLocation,
                newLocation
            }
        })
            .then(res => {
                setRenameFolder(false);
                setFiles(res.filesystem);
                // Update tabs
                const leftCopy = Array.from(left);
                const leftIndex = leftCopy.findIndex(
                    f => f.split("/").includes
                );
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    const deleteSelf = () => {
        del({
            route: "/api/folder/delete",
            data: { location }
        })
            .then(json => {
                setFiles(json.filesystem);
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    return (
        <>
            {!renameFolder ? (
                <div
                    className={`folder flex w-full cursor-pointer items-center justify-between rounded-md py-1 px-3 hover:bg-neutral-200 ${styles.folder}`}
                    onClick={() => setToggle(!toggle)}
                    title={name}>
                    <span className="flex min-w-0 items-center gap-x-1">
                        {content.length > 0 &&
                            (toggle ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            ))}
                        <FolderClosed className="h-4 w-4 shrink-0" />
                        <span className="truncate">{name}</span>
                    </span>
                    <span className={`${styles.extra} flex`}>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-md px-1 py-0.5 hover:bg-neutral-300">
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={event => {
                                        event.stopPropagation();
                                        setNameFolder(true);
                                    }}>
                                    New folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={event => {
                                        event.stopPropagation();
                                        setRenameFolder(true);
                                    }}>
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={event => {
                                        event.stopPropagation();
                                        deleteSelf();
                                    }}>
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
            ) : (
                <form
                    className="flex w-full max-w-full items-center justify-between rounded-md border border-blue-500 py-1 px-3 pl-5 shadow-md"
                    onSubmit={event => {
                        event.stopPropagation();
                        event.preventDefault();
                        if (
                            event.target.folder.value.length &&
                            event.target.folder.value !== name
                        )
                            renameSelf(event.target.folder.value);
                        event.target.reset();
                    }}>
                    <span className="flex min-w-0 max-w-full items-center gap-x-1 overflow-hidden">
                        <FolderClosed className="h-4 w-4 shrink-0" />
                        <input
                            className="max-w-full flex-1 overflow-auto bg-transparent"
                            autoComplete="off"
                            autoFocus={true}
                            name="folder"
                            onChange={event => event.stopPropagation()}
                            onBlur={event => {
                                if (
                                    !event.target.value.length ||
                                    event.target.value === name
                                ) {
                                    setRenameFolder(false);
                                    return;
                                }
                                event.target.value = "";
                                renameSelf(event.target.value);
                                setRenameFolder(false);
                            }}
                            required
                            title="Rename folder"
                            defaultValue={name}
                        />
                    </span>
                </form>
            )}
            {(nameFile || nameFolder) && (
                <form
                    className={`flex w-full max-w-full items-center justify-between rounded-md border border-blue-500 py-1 px-3 pl-5 shadow-md`}
                    onSubmit={event => {
                        event.preventDefault();
                        createFile(event.target.file.value);
                        event.target.reset();
                        setNameFile(false);
                    }}>
                    <span className="flex min-w-0 items-center gap-x-1 ">
                        <FileIcon className="h-4 w-4 shrink-0" />
                        <input
                            className="max-w-full flex-1 bg-transparent"
                            autoComplete="off"
                            autoFocus={true}
                            name="file"
                            onBlur={event => {
                                if (!event.target.value.length) {
                                    setNameFile(false);
                                    setNameFolder(false);
                                    return;
                                }
                                event.target.value = "";
                                if (nameFile) {
                                    createFile(event.target.value);
                                    setNameFile(false);
                                } else {
                                    console.log(
                                        `${location}/${event.target.value}`
                                    );
                                    setNameFolder(false);
                                }
                            }}
                            placeholder={`Untitled ${
                                nameFile ? "file" : "folder"
                            }`}
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
                                    key={`folder${file.name}`}
                                    {...file}
                                    toast={toast}
                                    location={`${location}/${file.name}`}
                                    userId={userId}
                                    setFiles={setFiles}
                                />
                            );
                        return (
                            <File
                                {...file}
                                key={`file${file.name}`}
                                openFile={openFile}
                                toast={toast}
                                location={`${location}/${file.name}`}
                                userId={userId}
                                setFiles={setFiles}
                                left={left}
                                right={right}
                                setLeft={setLeft}
                                setRight={setRight}
                                activeLeft={activeLeft}
                                activeRight={activeRight}
                                setActiveLeft={setActiveLeft}
                                setActiveRight={setActiveRight}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default function Files({
    files,
    setFiles,
    openFile,
    userId,
    left,
    right,
    setLeft,
    setRight,
    activeLeft,
    activeRight,
    setActiveLeft,
    setActiveRight
}) {
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
            route: "/api/folder/create",
            data: { location: folder }
        })
            .then(json => {
                setFiles(json.filesystem);
            })
            .catch(err =>
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: err
                })
            );
    };

    return (
        <div className="flex flex-col items-center py-1 px-2">
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
                        <FolderClosed className="h-4 w-4 shrink-0" />
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
                            setFiles={setFiles}
                            userId={userId}
                            left={left}
                            right={right}
                            setLeft={setLeft}
                            setRight={setRight}
                            activeLeft={activeLeft}
                            activeRight={activeRight}
                            setActiveLeft={setActiveLeft}
                            setActiveRight={setActiveRight}
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
                        setFiles={setFiles}
                        userId={userId}
                        left={left}
                        right={right}
                        setLeft={setLeft}
                        setRight={setRight}
                        activeLeft={activeLeft}
                        activeRight={activeRight}
                        setActiveLeft={setActiveLeft}
                        setActiveRight={setActiveRight}
                    />
                );
            })}
        </div>
    );
}

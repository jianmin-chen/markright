import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { useResizeDetector } from "react-resize-detector";
import Open from "./Open";
import { post } from "../utils/fetch";
import { BookOpen, MoreHorizontal } from "lucide-react";
import { useToast } from "../hooks/ui/useToast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuLabel
} from "./ui/DropdownMenu";
import { downloadHTML, downloadMarkdown } from "../utils/markdownUtils";
import ReactToPrint from "react-to-print";
import Tool, { tools } from "./Tool";

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

const ibmPlexMono = IBM_Plex_Mono({
    weight: "400",
    subsets: ["latin"]
});

const getItems = count =>
    Array.from({ length: count }, (v, k) => k).map(k => ({
        id: `item-${k}`,
        content: `item ${k}`
    }));

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

export default function Workspace({
    docRef,
    left,
    right,
    setLeft,
    setRight,
    activeLeft,
    activeRight,
    setActiveLeft,
    setActiveRight,
    aceOptions,
    setMessage,
    setValue,
    leftRef: leftScrollRef,
    rightRef: rightScrollRef
}) {
    const { toast } = useToast();

    const [leftTool, setLeftTool] = useState(null);
    const [rightTool, setRightTool] = useState(null);

    const leftRef = useResizeDetector();
    const rightRef = useResizeDetector();
    const [mirror, setMirror] = useState("");
    const [leftValue, setLeftValue] = useState("");
    const [rightValue, setRightValue] = useState("");
    const onDragEnd = result => {
        if (!result.destination) return;
        const source = result.source;
        const destination = result.destination;
        if (source.droppableId === destination.droppableId) {
            // Move in same array
            const items = reorder(
                source.droppableId === "left" ? left : right,
                source.index,
                destination.index
            );
            if (destination.droppableId === "left") {
                setLeft(items);
                setActiveLeft(destination.index);
            } else {
                setRight(items);
                setActiveRight(destination.index);
            }
        } else {
            // Remove from one, add to other
            const leftCopy = Array.from(left);
            const rightCopy = Array.from(right);
            const [removed] = (
                source.droppableId === "left" ? leftCopy : rightCopy
            ).splice(source.index, 1);
            (destination.droppableId === "left" ? leftCopy : rightCopy).splice(
                destination.index,
                0,
                removed
            );
            setLeft(leftCopy);
            setRight(rightCopy);
            if (source.droppableId === "left") {
                if (activeLeft === source.index) {
                    if (leftCopy.length === 1) setActiveLeft(0);
                    else if (leftCopy.length > 0)
                        setActiveLeft(source.index - 1);
                    else setActiveLeft(null);
                }
                setActiveRight(destination.index);
            } else if (source.droppableId === "right") {
                setActiveRight(source.index);
                setActiveLeft(destination.index);
            }
        }
    };

    const updateActiveTabs = async () => {
        // Run when tabs change
        try {
            if (left[activeLeft] && left[activeLeft].type === "input") {
                await post({
                    route: "/api/file/update",
                    data: {
                        location: left[activeLeft].location,
                        content: leftValue
                    }
                });
            }
            if (right[activeRight] && right[activeRight].type === "input") {
                await post({
                    route: "/api/file/update",
                    data: {
                        location: right[activeRight].location,
                        content: rightValue
                    }
                });
            }
            setMessage("Saved");
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Uh oh! Looks like there was an error",
                description: err
            });
        }
    };

    useEffect(() => {
        window.addEventListener("beforeunload", updateActiveTabs);
        return () => window.addEventListener("beforeunload", updateActiveTabs);
    }, []);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid h-full w-full grid-rows-2 overflow-hidden bg-white md:grid-cols-2">
                <div className="relative flex h-full flex-col overflow-hidden border-b md:border-b-0 md:border-r">
                    <Droppable droppableId="left" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex bg-neutral-100 dark:bg-slate-800">
                                {left.map((file, index) => (
                                    <Draggable
                                        key={`${file.filename}-${file.type}`}
                                        draggableId={`${file.filename}-${file.type}`}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${
                                                    snapshot.isDragging &&
                                                    "bg-neutral-200 shadow-sm"
                                                } ${
                                                    index === activeLeft &&
                                                    "bg-white"
                                                } flex w-[0] shrink grow basis-0 items-center justify-between border-b px-3 py-1.5 text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
                                                onClick={async () => {
                                                    await updateActiveTabs();
                                                    setActiveLeft(index);
                                                }}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <span
                                                            className={`flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-md text-[18px] font-light transition ${
                                                                activeLeft ===
                                                                index
                                                                    ? "hover:bg-neutral-100"
                                                                    : "hover:bg-neutral-200"
                                                            }`}
                                                            onClick={event => {
                                                                event.stopPropagation();
                                                            }}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </span>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {left[activeLeft]
                                                            .type ===
                                                        "output" ? (
                                                            <>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Download
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                downloadHTML(
                                                                                    leftValue,
                                                                                    left[
                                                                                        activeLeft
                                                                                    ]
                                                                                        .filename
                                                                                );
                                                                            }}>
                                                                            As
                                                                            HTML
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                downloadMarkdown(
                                                                                    leftValue,
                                                                                    left[
                                                                                        activeLeft
                                                                                    ]
                                                                                        .filename
                                                                                )
                                                                            }>
                                                                            As
                                                                            Markdown
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <ReactToPrint
                                                                    trigger={() => (
                                                                        <DropdownMenuItem>
                                                                            Print/Save
                                                                            as
                                                                            PDF
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    content={() =>
                                                                        leftRef.current
                                                                    }
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Paragraph
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        <DropdownMenuLabel>
                                                                            Coming
                                                                            soon!
                                                                        </DropdownMenuLabel>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Format
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        <DropdownMenuLabel>
                                                                            Coming
                                                                            soon!
                                                                        </DropdownMenuLabel>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Plugins
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        {/*
                                                                        {tools.map(
                                                                            tool => (
                                                                                <DropdownMenuItem
                                                                                    key={
                                                                                        tool
                                                                                    }
                                                                                    onClick={() =>
                                                                                        setRightTool(
                                                                                            tool
                                                                                        )
                                                                                    }>
                                                                                    {
                                                                                        tool
                                                                                    }
                                                                                </DropdownMenuItem>
                                                                            )
                                                                                )}*/}
                                                                        <DropdownMenuLabel>
                                                                            Coming
                                                                            soon!
                                                                        </DropdownMenuLabel>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <span className="flex-1 truncate">
                                                    {file.filename}
                                                </span>
                                                <span
                                                    className={`flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-md text-[18px] font-light transition ${
                                                        activeLeft === index
                                                            ? "hover:bg-neutral-100"
                                                            : "hover:bg-neutral-200"
                                                    }`}
                                                    onClick={async event => {
                                                        event.stopPropagation();
                                                        // Remove from left, then:
                                                        // * If user removed the active one, set it to index = 0 || index - 1
                                                        // * If user didn't remove the active one, update index to what it should be currently
                                                        await updateActiveTabs();
                                                        const leftCopy =
                                                            Array.from(left);
                                                        leftCopy.splice(
                                                            index,
                                                            1
                                                        );
                                                        setLeft(leftCopy);
                                                        if (
                                                            (activeLeft ===
                                                                index &&
                                                                activeLeft !==
                                                                    0) ||
                                                            index < activeLeft
                                                        )
                                                            setActiveLeft(
                                                                activeLeft - 1
                                                            );
                                                    }}>
                                                    &times;
                                                </span>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <div
                        className="relative h-full flex-1 overflow-hidden"
                        ref={leftRef.ref}>
                        {activeLeft !== null &&
                        left[activeLeft] !== undefined ? (
                            <Open
                                docRef={docRef}
                                file={left[activeLeft]}
                                sizeRef={leftRef}
                                aceOptions={aceOptions}
                                setMessage={setMessage}
                                setSideValue={setLeftValue}
                                mirror={
                                    left[activeLeft] &&
                                    right[activeRight] &&
                                    left[activeLeft].location ===
                                        right[activeRight].location
                                        ? mirror
                                        : null
                                }
                                setMirror={setMirror}
                                onScroll={(scrollTop, height) => {
                                    if (
                                        !left[activeLeft] ||
                                        !right[activeRight]
                                    )
                                        return;
                                    if (
                                        left[activeLeft].location !==
                                        right[activeRight].location
                                    )
                                        return;
                                    let rightDiv = rightRef.current;
                                    if (rightDiv) {
                                        if (rightDiv.editor) {
                                            // Scroll input
                                            let scrollProportion = Math.max(
                                                0,
                                                scrollTop / height
                                            );
                                            if (scrollTop === 0)
                                                rightDiv.editor.session.setScrollTop(
                                                    -32
                                                );
                                            else
                                                rightDiv.editor.session.setScrollTop(
                                                    rightDiv.editor.session.setScrollTop(
                                                        rightDiv.editor.renderer
                                                            .layerConfig
                                                            .maxHeight *
                                                            scrollProportion
                                                    )
                                                );
                                        } else {
                                            let scrollProportion = Math.max(
                                                0,
                                                scrollTop / height
                                            );
                                            rightDiv.scrollTop =
                                                rightDiv.scrollHeight *
                                                scrollProportion;
                                            if (
                                                scrollTop +
                                                    rightDiv.offsetHeight ===
                                                height
                                            )
                                                rightDiv.scrollTop =
                                                    rightDiv.scrollHeight;
                                        }
                                    }
                                }}
                                scrollRef={leftRef}
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-neutral-200">
                                <BookOpen
                                    className="h-32 w-32"
                                    strokeWidth={0.5}
                                />
                                <p>Nothing opened yet</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative flex h-full flex-col overflow-hidden">
                    {/*{rightTool !== null && <Tool name={rightTool} />}*/}
                    <Droppable droppableId="right" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex bg-neutral-100 dark:bg-slate-800">
                                {right.map((file, index) => (
                                    <Draggable
                                        key={`${file.filename}-${file.type}`}
                                        draggableId={`${file.filename}-${file.type}`}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${
                                                    snapshot.isDragging &&
                                                    "bg-neutral-200 shadow-sm"
                                                } ${
                                                    index === activeRight &&
                                                    "bg-white"
                                                } flex w-[0] shrink grow basis-0 items-center justify-center border-b px-3 py-1.5  text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
                                                onClick={async () => {
                                                    await updateActiveTabs();
                                                    setActiveRight(index);
                                                }}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <span
                                                            className={`flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-md text-[18px] font-light transition ${
                                                                activeLeft ===
                                                                index
                                                                    ? "hover:bg-neutral-100"
                                                                    : "hover:bg-neutral-200"
                                                            }`}
                                                            onClick={event => {
                                                                event.stopPropagation();
                                                            }}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </span>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {right[activeRight]
                                                            .type ===
                                                        "output" ? (
                                                            <>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Download
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                downloadHTML(
                                                                                    rightValue,
                                                                                    right[
                                                                                        activeRight
                                                                                    ]
                                                                                        .filename
                                                                                );
                                                                            }}>
                                                                            As
                                                                            HTML
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                downloadMarkdown(
                                                                                    rightValue,
                                                                                    right[
                                                                                        activeRight
                                                                                    ]
                                                                                        .filename
                                                                                )
                                                                            }>
                                                                            As
                                                                            Markdown
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <ReactToPrint
                                                                    trigger={() => (
                                                                        <DropdownMenuItem>
                                                                            Print/Save
                                                                            as
                                                                            PDF
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    content={() =>
                                                                        rightRef.current
                                                                    }
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Paragraph
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        <DropdownMenuLabel>
                                                                            Coming
                                                                            soon!
                                                                        </DropdownMenuLabel>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Format
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        <DropdownMenuLabel>
                                                                            Coming
                                                                            soon!
                                                                        </DropdownMenuLabel>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger>
                                                                        Plugins
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        {/*
                                                                        {tools.map(
                                                                            tool => (
                                                                                <DropdownMenuItem
                                                                                    key={
                                                                                        tool
                                                                                    }
                                                                                    onClick={() =>
                                                                                        setTool(
                                                                                            tool
                                                                                        )
                                                                                    }>
                                                                                    {
                                                                                        tool
                                                                                    }
                                                                                </DropdownMenuItem>
                                                                            )
                                                                                )}*/}
                                                                        <DropdownMenuLabel>
                                                                            Coming
                                                                            soon!
                                                                        </DropdownMenuLabel>
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <span className="flex-1 truncate">
                                                    {file.filename}
                                                </span>
                                                <span
                                                    className={`flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-md text-[18px] font-light transition hover:bg-neutral-100 ${
                                                        activeRight === index
                                                            ? "hover:bg-neutral-100"
                                                            : "hover:bg-neutral-200"
                                                    }`}
                                                    onClick={async event => {
                                                        event.stopPropagation();
                                                        await updateActiveTabs();
                                                        const rightCopy =
                                                            Array.from(right);
                                                        rightCopy.splice(
                                                            index,
                                                            1
                                                        );
                                                        setRight(rightCopy);
                                                        if (
                                                            (activeRight ===
                                                                index &&
                                                                activeRight !==
                                                                    0) ||
                                                            index < activeRight
                                                        )
                                                            setActiveRight(
                                                                activeRight - 1
                                                            );
                                                    }}>
                                                    &times;
                                                </span>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <div
                        className="relative h-full flex-1 overflow-hidden"
                        ref={rightRef.ref}>
                        {activeRight !== null &&
                        right[activeRight] !== undefined ? (
                            <Open
                                file={right[activeRight]}
                                aceOptions={aceOptions}
                                updateValue={value => {
                                    if (right[activeRight].type === "input") {
                                        // Update value in tabs
                                        const rightCopy = Array.from(right);
                                        rightCopy[activeRight].content = value;
                                        setRight(leftCopy);
                                    }
                                }}
                                setSideValue={setRightValue}
                                setMessage={setMessage}
                                sizeRef={rightRef}
                                mirror={
                                    left[activeLeft] &&
                                    right[activeRight] &&
                                    left[activeLeft].location ===
                                        right[activeRight].location
                                        ? mirror
                                        : null
                                }
                                onScroll={(scrollTop, height) => {
                                    if (
                                        !left[activeLeft] ||
                                        !right[activeRight]
                                    )
                                        return;
                                    if (
                                        left[activeLeft].location !==
                                        right[activeRight].location
                                    )
                                        return;
                                    let leftDiv = leftRef.current;
                                    if (leftDiv) {
                                        if (leftDiv.editor) {
                                            // Scroll input
                                            let scrollProportion = Math.max(
                                                0,
                                                scrollTop / height
                                            );
                                            if (scrollTop === 0)
                                                leftDiv.editor.session.setScrollTop(
                                                    -32
                                                );
                                            // Account for padding
                                            else
                                                leftDiv.editor.session.setScrollTop(
                                                    leftDiv.editor.session.setScrollTop(
                                                        leftDiv.editor.renderer
                                                            .layerConfig
                                                            .maxHeight *
                                                            scrollProportion
                                                    )
                                                );
                                        } else {
                                            let scrollProportion = Math.max(
                                                0,
                                                scrollTop / height
                                            );
                                            leftDiv.scrollTop =
                                                leftDiv.scrollHeight *
                                                scrollProportion;
                                            if (
                                                scrollTop +
                                                    leftDiv.offsetHeight ===
                                                height
                                            )
                                                leftDiv.scrollTop =
                                                    leftDiv.scrollHeight;
                                        }
                                    }
                                }}
                                setMirror={setMirror}
                                scrollRef={rightRef}
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-neutral-200">
                                <BookOpen
                                    className="h-32 w-32"
                                    strokeWidth={0.5}
                                />
                                <p>Nothing opened yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}

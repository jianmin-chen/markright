import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { useResizeDetector } from "react-resize-detector";
import Open from "./Open";
import { post } from "../utils/fetch";
import { BookOpen } from "lucide-react";
import { useToast } from "../hooks/ui/useToast";

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
    setValue
}) {
    const { toast } = useToast();
    const leftRef = useResizeDetector();
    const rightRef = useResizeDetector();
    const [mirror, setMirror] = useState("");
    const [leftValue, setLeftValue] = useState("");
    const [rightValue, setRightValue] = useState("");
    const [outputScroll, setOutputScroll] = useState(false);
    const input = docRef;
    const output = useRef(null);

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

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid h-full w-full grid-cols-2 overflow-hidden">
                <div className="flex h-full flex-col overflow-hidden border-r">
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
                                                } flex w-[0] shrink grow basis-0 items-center justify-center border-b px-3 py-1.5  text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
                                                onClick={async () => {
                                                    await updateActiveTabs();
                                                    setActiveLeft(index);
                                                }}>
                                                <span className="flex-1 truncate">
                                                    {file.filename}
                                                </span>
                                                <span
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        const leftCopy =
                                                            Array.from(left);
                                                        leftCopy.splice(
                                                            index,
                                                            1
                                                        );
                                                        setLeft(leftCopy);
                                                        if (
                                                            activeLeft === index
                                                        ) {
                                                            let active = null;
                                                            if (
                                                                leftCopy.length ===
                                                                    1 ||
                                                                index === 0
                                                            )
                                                                active = 0;
                                                            else if (
                                                                leftCopy.length >
                                                                1
                                                            )
                                                                active =
                                                                    index - 1;
                                                            console.log(active);
                                                            setActiveLeft(
                                                                active
                                                            );
                                                        }
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
                <div className="flex h-full flex-col overflow-hidden">
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
                                                <span className="flex-1 truncate">
                                                    {file.filename}
                                                </span>
                                                <span
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        // Remove from right - if it's the active one, check if there's one we can move over
                                                        const rightCopy =
                                                            Array.from(right);
                                                        rightCopy.splice(
                                                            index,
                                                            1
                                                        );
                                                        if (
                                                            activeRight ===
                                                            index
                                                        ) {
                                                            let active = null;
                                                            if (
                                                                rightCopy.length !=
                                                                0
                                                            ) {
                                                                if (index === 0)
                                                                    active = 0;
                                                                else
                                                                    active =
                                                                        index -
                                                                        1;
                                                            }
                                                            setActiveRight(
                                                                active
                                                            );
                                                        }
                                                        setRight(rightCopy);
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
                                setMirror={setMirror}
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

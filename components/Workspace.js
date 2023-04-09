import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { useResizeDetector } from "react-resize-detector";
import Open from "./Open";
import { post } from "../utils/fetch";

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
    const leftRef = useResizeDetector();
    const rightRef = useResizeDetector();

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
            console.log(source.index, destination.index);
            if (source.droppableId === "left") {
                // Left has one extra one, so set it to the index; right has one less, so set it to index - 1 if it isn't empty
                setActiveLeft(destination.index);
                setActiveRight(source.index);
            } else if (source.droppableId === "right") {
                setActiveRight(destination.index);
                setActiveLeft(source.index);
            }
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
                                                onClick={() => {
                                                    setActiveLeft(index);
                                                }}>
                                                <span className="flex-1 truncate">
                                                    {file.filename}
                                                </span>
                                                <span>&times;</span>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <div
                        className="h-full flex-1 overflow-auto"
                        ref={leftRef.ref}>
                        {activeLeft !== null && (
                            <Open
                                docRef={docRef}
                                file={left[activeLeft]}
                                sizeRef={leftRef}
                                aceOptions={aceOptions}
                                setMessage={setMessage}
                                setOutlineValue={setValue}
                            />
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
                                                onClick={() =>
                                                    setActiveRight(index)
                                                }>
                                                <span className="flex-1 truncate">
                                                    {file.filename}
                                                </span>
                                                <span>&times;</span>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <div className="h-full flex-1 overflow-auto border-none p-0">
                        {activeRight !== null && (
                            <Open
                                file={right[activeRight]}
                                sizeRef={rightRef}
                                aceOptions={aceOptions}
                                updateValue={value => {
                                    if (right[activeRight].type === "input") {
                                        // Update value in tabs
                                        const rightCopy = Array.from(right);
                                        rightCopy[activeRight].content = value;
                                        setRight(leftCopy);
                                    }
                                }}
                                setMessage={setMessage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}

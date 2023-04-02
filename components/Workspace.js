import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AceEditor from "./AceEditor";
import parseMarkdown from "../utils/parser";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { useResizeDetector } from "react-resize-detector";
import { CircleDot } from "lucide-react";

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
    value,
    setValue,
    keyboardHandler,
    aceTheme,
    docRef
}) {
    const { width, height, ref } = useResizeDetector();

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
            if (destination.droppableId === "left") setLeft(items);
            else setRight(items);
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
        }
    };

    // Left and right columns
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const [activeLeft, setActiveLeft] = useState(0);
    const [activeRight, setActiveRight] = useState(0);

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
                                                } flex w-[0] shrink grow basis-0 items-center justify-center px-3 py-1.5  text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
                                                onClick={() =>
                                                    setActiveLeft(index)
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
                    <div className="h-full flex-1 overflow-auto" ref={ref}>
                        <AceEditor
                            options={{
                                keyboardHandler,
                                theme: aceTheme
                            }}
                            assignRef={docRef}
                            value={value}
                            setValue={setValue}
                            onScroll={(scrollTop, height) => {
                                if (!outputScroll) {
                                    let outputDiv = output.current;
                                    if (outputDiv) {
                                        let scrollProportion =
                                            scrollTop / height;
                                        if (scrollProportion < 0)
                                            scrollProportion = 0; // Clamp
                                        outputDiv.scrollTop =
                                            outputDiv.scrollHeight *
                                            scrollProportion;

                                        if (
                                            scrollTop +
                                                outputDiv.offsetHeight ===
                                            height
                                        )
                                            outputDiv.scrollTop =
                                                outputDiv.scrollHeight;
                                    }
                                }
                            }}
                            width={width}
                            height={height}
                        />
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
                                                } flex w-[0] shrink grow basis-0 items-center justify-center px-3 py-1.5  text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
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
                    <div
                        className="h-full flex-1 overflow-auto border-none p-0"
                        id="output"
                        ref={output}
                        onMouseEnter={() => setOutputScroll(true)}
                        onMouseLeave={() => setOutputScroll(false)}
                        onScroll={event => {
                            if (outputScroll && input.current) {
                                let editor = input.current.editor;
                                if (event.target.scrollTop === 0)
                                    editor.session.setScrollTop(-32);
                                // Account for padding
                                else {
                                    const scrollTop = event.target.scrollTop;
                                    const height = event.target.scrollHeight;
                                    let scrollProportion = scrollTop / height;
                                    editor.session.setScrollTop(
                                        editor.renderer.layerConfig.maxHeight *
                                            scrollProportion
                                    );
                                }
                            }
                        }}
                        value="3">
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
                </div>
            </div>
        </DragDropContext>
    );
}

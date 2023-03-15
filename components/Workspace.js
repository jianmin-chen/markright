import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AceEditor from "./AceEditor";
import parseMarkdown from "../utils/parser";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { useResizeDetector } from "react-resize-detector";

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
    aceTheme
}) {
    const { width, height, ref } = useResizeDetector();

    const [outputScroll, setOutputScroll] = useState(false);
    const input = useRef(null);
    const output = useRef(null);

    const [openFiles, setOpenFiles] = useState(getItems(6));
    const onDragEnd = result => {
        if (!result.destination) return;
        const items = reorder(
            openFiles,
            result.source.index,
            result.destination.index
        );
        setOpenFiles(items);
    };

    // Left and right columns

    return (
        <div className="grid h-full w-full grid-cols-2 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden border-r">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex bg-neutral-100 dark:bg-slate-800">
                                {openFiles.map((file, index) => (
                                    <Draggable
                                        key={file.id}
                                        draggableId={file.id}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${
                                                    snapshot.isDragging &&
                                                    "bg-neutral-200 shadow-sm"
                                                } flex w-full items-center justify-center px-3 py-1.5  text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
                                                value={`${index}`}>
                                                <span className="flex-1 truncate">
                                                    {file.id}
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
                </DragDropContext>
                <div className="h-full flex-1 overflow-auto" ref={ref}>
                    <AceEditor
                        options={{
                            keyboardHandler,
                            theme: aceTheme
                        }}
                        value={value}
                        setValue={setValue}
                        assignRef={input}
                        onScroll={(scrollTop, height) => {
                            if (!outputScroll) {
                                let outputDiv = output.current;
                                if (outputDiv) {
                                    let scrollProportion = scrollTop / height;
                                    if (scrollProportion < 0)
                                        scrollProportion = 0; // Clamp
                                    outputDiv.scrollTop =
                                        outputDiv.scrollHeight *
                                        scrollProportion;

                                    if (
                                        scrollTop + outputDiv.offsetHeight ===
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
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex bg-neutral-100 dark:bg-slate-800">
                                {openFiles.map((file, index) => (
                                    <Draggable
                                        key={file.id}
                                        draggableId={file.id}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${
                                                    snapshot.isDragging &&
                                                    "bg-neutral-200 shadow-sm"
                                                } flex w-full items-center justify-center px-3 py-1.5  text-center text-sm font-medium text-slate-700  !shadow-none transition-colors  disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-200 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100`}
                                                value={`${index}`}>
                                                <span className="flex-1 truncate">
                                                    {file.id}
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
                </DragDropContext>
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
                            margin-top: 1.33rem !important;
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
    );
}

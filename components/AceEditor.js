import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vscode";
import "ace-builds/src-noconflict/keybinding-vim";
import { useState } from "react";

export default function Editor({
    options,
    value,
    setValue,
    onBlur,
    width,
    height,
    onScroll,
    scrollRef,
    scroll
}) {
    return (
        <AceEditor
            {...options}
            commands={[
                {
                    name: "insertItalic",
                    bindKey: {
                        win: "Ctrl-i",
                        mac: "Cmd-i"
                    },
                    exec: editor => {
                        let { row, column } = editor.getCursorPosition();
                        if (editor.session.getLine(row)[column] === "*") {
                            // Italic already there, get out of it
                            try {
                                editor.moveCursorTo(row, column + 1);
                                return;
                            } catch {}
                        }
                        editor.insert("**");
                        ({ row, column } = editor.getCursorPosition());
                        editor.moveCursorTo(row, column - 1);
                    }
                },
                {
                    name: "insertBold",
                    bindKey: {
                        win: "Ctrl-b",
                        mac: "Cmd-b"
                    },
                    exec: editor => {
                        let { row, column } = editor.getCursorPosition();
                        if (
                            editor.session.getLine(row)[column] === "*" &&
                            editor.session.getLine(row)[column + 1] === "*"
                        ) {
                            try {
                                editor.moveCursorTo(row, column + 2);
                                return;
                            } catch {}
                        }
                        editor.insert("****");
                        ({ row, column } = editor.getCursorPosition());
                        editor.moveCursorTo(row, column - 2);
                    }
                }
            ]}
            mode="markdown"
            width={width}
            height={height}
            onBlur={onBlur}
            onChange={setValue}
            value={value}
            fontSize={18}
            showGutter={false}
            showPrintMargin={false}
            wrapEnabled={true}
            setOptions={{
                enableBasicAutocompletion: true,
                cursorStyle: "slim"
            }}
            ref={scrollRef}
            onLoad={editor => {
                editor.renderer.setPadding(32);
                editor.renderer.setScrollMargin(32);
            }}
            onScroll={editor => {
                if (scroll)
                    onScroll(
                        editor.session.getScrollTop(),
                        editor.renderer.layerConfig.maxHeight
                    );
            }}
        />
    );
}

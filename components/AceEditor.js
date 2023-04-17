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
                        editor.renderer.layerConfig.maxHeight,
                        "input"
                    );
            }}
        />
    );
}

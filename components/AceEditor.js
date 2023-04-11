import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vscode";
import "ace-builds/src-noconflict/keybinding-vim";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
    weight: "400",
    subsets: ["latin"]
});

export default function Editor({
    options,
    value,
    setValue,
    onScroll,
    onBlur,
    assignRef,
    width,
    height
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
            ref={assignRef}
            onLoad={editor => {
                editor.renderer.setPadding(32);
                editor.renderer.setScrollMargin(32);
            }}
            onScroll={editor => {
                onScroll(
                    editor.session.getScrollTop(),
                    editor.renderer.layerConfig.maxHeight
                );
            }}
        />
    );
}

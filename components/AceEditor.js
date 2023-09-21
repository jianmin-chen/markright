import PreferencesContext from "./PreferencesContext";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-noconflict/keybinding-vscode";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-terminal";
import EmojiPicker from "emoji-picker-react";
import { useContext, useState } from "react";

export default function Editor({
    value,
    setValue,
    onBlur,
    width,
    height,
    onScroll,
    scrollRef,
    scroll
}) {
    const { theme, keyboardHandler } = useContext(PreferencesContext);
    const [emoji, setEmoji] = useState({});

    return (
        <>
            <AceEditor
                className="dark:bg-neutral-900"
                theme={theme === "dark" ? "terminal" : "github"}
                keyboardHandler={keyboardHandler}
                commands={[
                    {
                        name: "insertCodeBlock",
                        bindKey: {
                            win: "Ctrl-alt-c",
                            mac: "Ctrl-option-c"
                        },
                        exec: editor => {
                            let { row, column } = editor.getCursorPosition();
                            editor.insert("\n\n```\n```\n");
                            try {
                                editor.moveCursorTo(row - 2, column + 3);
                            } catch {}
                        }
                    },
                    {
                        name: "insertBlockquote",
                        bindKey: {
                            win: "Ctrl+option+q",
                            mac: "Ctrl+option+q"
                        },
                        exec: editor => {
                            let { row, column } = editor.getCursorPosition();
                            if (editor.session.getLine(row)[0] === ">") {
                                // Blockquote already there, get out of it
                            }
                        }
                    },
                    {
                        name: "insertOl",
                        bindKey: {
                            win: "Ctrl+option+o",
                            mac: "Ctrl+option+o"
                        },
                        exec: editor => {
                            let { row, column } = editor.getCursorPosition();
                            if (
                                Number.isInteger(
                                    editor.session.getLine(row)[0]
                                ) &&
                                editor.session.getLine(row).slice(1, 3) === ". "
                            ) {
                                // Ordered list already there, get out of it
                            }
                        }
                    },
                    {
                        name: "insertUl",
                        bindKey: {
                            win: "Ctrl+option+u",
                            mac: "Ctrl+option+u"
                        },
                        exec: editor => {
                            let { row, column } = editor.getCursorPosition();
                            if (
                                editor.session.getLine(row).slice(0, 2) === "* "
                            ) {
                                // Unordered list already there, get out of it
                            }
                        }
                    },
                    {
                        name: "insertTl",
                        bindKey: {
                            win: "Ctrl+option+t",
                            mac: "Ctrl+option+t"
                        },
                        exec: editor => {
                            let { row, column } = editor.getCursorPosition();
                            if (
                                editor.session.getLine(row).slice(0, 5) ===
                                    "- [ ]" ||
                                editor.session.getLine(row).slice(0, 5) ===
                                    "- [ ]"
                            ) {
                                // Task list already there, get out of it
                            }
                        }
                    },
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
                    },
                    {
                        name: "insertEmoji",
                        bindKey: {
                            win: "Ctrl+.",
                            mac: "Cmd-e"
                        },
                        exec: editor => {
                            const { row, column } = editor.getCursorPosition();
                            const pos = editor.renderer.$cursorLayer.getPixelPosition((row, column), true);
                            let emojiPos = {};
                            emojiPos.left = pos.left + 350;
                            emojiPos.top = Math.max(0, height % pos.top - 500);
                            console.log(emojiPos);
                            setEmoji(emojiPos);
                        }
                    },
                    {
                        name: "unfocus",
                        bindKey: {
                            win: "Ctrl-e",
                            mac: "Ctrl-e"
                        },
                        exec: editor => {
                            console.log("yup");
                            editor.blur();
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
            <div className={`fixed ${!Object.keys(emoji).length && "hidden"}`} style={emoji}>
                <EmojiPicker onEmojiClick={emoji => {
                    scrollRef.current.editor.insert(emoji.emoji)
                    setEmoji({})
                }} theme={theme} emojiStyle="native" />
            </div>
        </>
    );
}

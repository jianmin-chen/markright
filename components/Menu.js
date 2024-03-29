import { useToast } from "../hooks/ui/useToast";
import { post } from "../utils/fetch";
import PreferencesContext from "./PreferencesContext";
import Unsplash from "./Unsplash";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
    MenubarLabel
} from "./ui/Menubar";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useContext, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export default function MenubarDemo({
    downloads,
    sidebar,
    message,
    setBackground
}) {
    const { data: session } = useSession();
    const { theme, setTheme, keyboardHandler, setKeyboardHandler } =
        useContext(PreferencesContext);

    const toggleFullscreen = event => {
        if (event) event.preventDefault();
        if (document) {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.body.requestFullscreen();
        }
    };

    const toggleSidebar = event => {
        event.preventDefault();
        sidebar.showSidebar(!sidebar.sidebar);
    };

    useHotkeys("ctrl+b, meta+b", toggleSidebar);

    return (
        <Dialog>
            <Menubar className="backdrop-blur-50 h-fit space-x-0 rounded-none border-none bg-white/70 px-3 py-0 backdrop-invert backdrop-opacity-5 backdrop-saturate-150 dark:bg-neutral-900/70 dark:text-white">
                <MenubarMenu>
                    <MenubarTrigger className="px-1.5 py-2 leading-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                        <b>{session && session.user.name}</b>
                    </MenubarTrigger>
                    <MenubarContent>
                        <a
                            href="https://github.com/jianmin-chen/markright"
                            target="_blank">
                            <MenubarItem>About</MenubarItem>
                        </a>
                        <MenubarItem
                            onClick={() => {
                                window.localStorage.removeItem("theme");
                                signOut({ callbackUrl: "/" });
                            }}>
                            Sign out
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="px-1 py-2 leading-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                        Preferences
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Background</MenubarSubTrigger>
                            <MenubarSubContent>
                                <Unsplash setBackground={setBackground} />
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSub>
                            <MenubarSubTrigger>Main theme</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarCheckboxItem
                                    checked={theme === "light"}
                                    onClick={() => setTheme("light")}>
                                    Light
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={theme === "dark"}
                                    onClick={() => setTheme("dark")}>
                                    Dark
                                </MenubarCheckboxItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarLabel>Editor</MenubarLabel>
                        <MenubarSub>
                            <MenubarSubTrigger>Keybindings</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarCheckboxItem
                                    checked={!keyboardHandler}
                                    onClick={() => setKeyboardHandler("")}>
                                    None
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={keyboardHandler === "emacs"}
                                    onClick={() => setKeyboardHandler("emacs")}>
                                    Emacs
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={keyboardHandler === "sublime"}
                                    onClick={() =>
                                        setKeyboardHandler("sublime")
                                    }>
                                    Sublime
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={keyboardHandler === "vim"}
                                    onClick={() => setKeyboardHandler("vim")}>
                                    Vim
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={keyboardHandler === "vscode"}
                                    onClick={() =>
                                        setKeyboardHandler("vscode")
                                    }>
                                    VS Code
                                </MenubarCheckboxItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="px-1 py-2 leading-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                        View
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={toggleFullscreen}>
                            Toggle Fullscreen
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={toggleSidebar}>
                            Toggle Sidebar <MenubarShortcut>⌘B</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="!ml-auto px-1 py-2 leading-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                        {message}
                    </MenubarTrigger>
                </MenubarMenu>
            </Menubar>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Name of file</DialogTitle>
                    <DialogDescription>
                        <Input placeholder="Name of file" />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

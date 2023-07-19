import { signOut, useSession } from "next-auth/react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/Dialog";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { useToast } from "../hooks/ui/useToast";
import { useEffect, useContext } from "react";
import Unsplash from "./Unsplash";
import ThemeContext from "./ThemeContext";
import { useHotkeys } from "react-hotkeys-hook";

export default function MenubarDemo({
    keyboardHandler,
    downloads,
    sidebar,
    message,
    setBackground
}) {
    const { data: session } = useSession();
    const { theme, setTheme } = useContext(ThemeContext);

    const toggleFullscreen = () => {
        if (document) {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.body.requestFullscreen();
        }
    };

    const toggleSidebar = () => sidebar.showSidebar(!sidebar.sidebar);
    useHotkeys("ctrl+b", toggleSidebar);

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
                            onClick={() => signOut({ callbackUrl: "/" })}>
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
                            <MenubarSubTrigger>Main theme</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarCheckboxItem checked>
                                    GitHub
                                </MenubarCheckboxItem>
                                <MenubarItem inset disabled>
                                    More coming soon!
                                </MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSub>
                            <MenubarSubTrigger>Keybindings</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarCheckboxItem
                                    checked={!keyboardHandler.keyboardHandler}
                                    onClick={() =>
                                        keyboardHandler.setKeyboardHandler("")
                                    }>
                                    None
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={
                                        keyboardHandler.keyboardHandler ===
                                        "emacs"
                                    }
                                    onClick={() =>
                                        keyboardHandler.setKeyboardHandler(
                                            "emacs"
                                        )
                                    }>
                                    Emacs
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={
                                        keyboardHandler.keyboardHandler ===
                                        "sublime"
                                    }
                                    onClick={() =>
                                        keyboardHandler.setKeyboardHandler(
                                            "sublime"
                                        )
                                    }>
                                    Sublime
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={
                                        keyboardHandler.keyboardHandler ===
                                        "vim"
                                    }
                                    onClick={() =>
                                        keyboardHandler.setKeyboardHandler(
                                            "vim"
                                        )
                                    }>
                                    Vim
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem
                                    checked={
                                        keyboardHandler.keyboardHandler ===
                                        "vscode"
                                    }
                                    onClick={() =>
                                        keyboardHandler.setKeyboardHandler(
                                            "vscode"
                                        )
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
                            Toggle Sidebar
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

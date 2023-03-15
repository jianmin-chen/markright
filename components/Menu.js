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
} from "./ui/dialog";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { useToast } from "../hooks/ui/useToast";
import { useEffect } from "react";
import Unsplash from "./Unsplash";

export default function MenubarDemo({ keyboardHandler, downloads, sidebar }) {
    const { toast } = useToast();
    const { data: session } = useSession();

    const toggleFullscreen = () => {
        if (document) {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.body.requestFullscreen();
        }
    };

    const toggleSidebar = () => sidebar.showSidebar(!sidebar.sidebar);

    return (
        <Dialog>
            <Menubar className="backdrop-opacity-5 backdrop-invert bg-white/70 backdrop-saturate-150 backdrop-blur-50 rounded-none border-none px-3 py-0 h-fit space-x-0">
                <MenubarMenu>
                    <MenubarTrigger className="leading-none px-1.5 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
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
                    <MenubarTrigger className="leading-none px-1 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
                        Preferences
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Main theme</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarCheckboxItem checked>
                                    Light
                                </MenubarCheckboxItem>
                                <MenubarItem inset disabled>
                                    More coming soon!
                                </MenubarItem>
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
                    <MenubarTrigger className="leading-none px-1 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
                        File
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarSub>
                            <MenubarSubTrigger>Download</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem onClick={downloads.downloadHTML}>
                                    As HTML
                                </MenubarItem>
                                <MenubarItem
                                    onClick={downloads.downloadMarkdown}>
                                    As Markdown
                                </MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarItem onClick={() => window.print()}>
                            Print/Save as PDF{" "}
                            <MenubarShortcut>⌘P</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="leading-none px-1 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
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

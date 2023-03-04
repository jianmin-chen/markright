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
    MenubarTrigger
} from "./ui/Menubar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Input } from "./ui/Input";
import { useToast } from "../hooks/ui/useToast";

export default function MenubarDemo({ preferences }) {
    const { toast } = useToast();

    return (
        <Dialog>
            <Menubar className="backdrop-opacity-5 backdrop-invert bg-white/60 backdrop-saturate-150 backdrop-blur-50 rounded-none border-none px-3 py-0 h-fit space-x-0">
                <MenubarMenu>
                    <MenubarTrigger className="leading-none px-1.5 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
                        <b>markright</b>
                    </MenubarTrigger>
                    <MenubarContent>
                        <a
                            href="https://github.com/jianmin-chen/markright"
                            target="_blank">
                            <MenubarItem>About</MenubarItem>
                        </a>
                        <MenubarItem
                            onClick={() =>
                                toast({
                                    title: "Log out",
                                    description: "Log out successful!"
                                })
                            }>
                            Sign out
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="leading-none px-1.5 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
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
                        <MenubarItem disabled>Editor</MenubarItem>
                        <MenubarSub>
                            <MenubarSubTrigger>Keybindings</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarCheckboxItem>None</MenubarCheckboxItem>
                                <MenubarCheckboxItem>Emacs</MenubarCheckboxItem>
                                <MenubarCheckboxItem>
                                    Sublime
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem checked>
                                    Vim
                                </MenubarCheckboxItem>
                                <MenubarCheckboxItem>
                                    VS Code
                                </MenubarCheckboxItem>
                            </MenubarSubContent>
                        </MenubarSub>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="leading-none px-1.5 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
                        File
                    </MenubarTrigger>
                    <MenubarContent>
                        <DialogTrigger asChild>
                            <MenubarItem>
                                New file <MenubarShortcut>⌘N</MenubarShortcut>
                            </MenubarItem>
                        </DialogTrigger>

                        <MenubarSub>
                            <MenubarSubTrigger>Download</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem>As HTML</MenubarItem>
                                <MenubarItem>As Markdown</MenubarItem>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                        <MenubarItem>
                            Print... <MenubarShortcut>⌘P</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="leading-none px-1.5 py-2 data-[state=open]:bg-transparent hover:bg-transparent focus:bg-transparent">
                        View
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>Toggle Fullscreen</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Hide Sidebar</MenubarItem>
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

let input, output, menu, folderContextmenu, fileContextmenu, editor;

class Editor {
    constructor(input, output, menu, folderContextmenu, fileContextmenu) {
        // * Initializing state involves setting up the file tree and the current active file (if any)
        this.input = input;
        this.output = output;
        this.menu = menu;
        this.folderContextmenu = folderContextmenu;
        this.fileContextmenu = fileContextmenu;

        this.files = {};
        this.activeFile;
        this.openFolders = [];

        this.getFiles()
            .then(res => res.json())
            .then(files => {
                if (Object.keys(files).length) {
                    // There are files, so let's populate the file tree
                    this.files = files;

                    let active = localStorage.getItem("markright-active");
                    if (active) {
                        this.activeFile = active;
                        this.openFolders.push(this.activeFile.split("/")[0]); // Keep folder open
                        this.updateEditor();
                    }

                    let openFolders = localStorage.getItem(
                        "markright-open-folders"
                    );
                    if (openFolders) this.openFolders = JSON.parse(openFolders);
                    this.updateFiletree();
                } else {
                    // No files, so let's initialize localStorage
                    localStorage.setItem("markright-open-folders", "[]");
                }
            });
    }

    setActive(location) {
        this.activeFile = location;
        localStorage.setItem("markright-active", location);
        this.updateFiletree();
    }

    async newFolder(foldername) {
        // C - create new folder
        if (foldername in this.files) throw new Error("Folder already exists");
        this.files[foldername] = {};

        // Update the filetree
        this.updateFiletree();

        await fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(this.files)
            })
        });
    }

    async newFile(foldername, filename) {
        // C - create new file
        if (this.fileExists(foldername, filename))
            throw new Error("File already exists");
        this.files[foldername][filename] = "";

        // Update open folders
        if (this.openFolders.indexOf(foldername) === -1) {
            this.openFolders.push(foldername);
            localStorage.setItem(
                "markright-open-folders",
                JSON.stringify(this.openFolders)
            );
        }

        // Update the editor and filetree (set new file to active)
        this.setActive(`${foldername}/${filename}`);
        this.updateEditor();
        this.updateFiletree();

        await fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(this.files)
            })
        });
    }

    async getFiles() {
        // R
        return await fetch("/api/getFiles");
    }

    getFile(location) {
        // R - specific file
        let [foldername, filename] = location.split("/");
        return this.files[foldername][filename];
    }

    folderExists(foldername) {
        // R - does folder exist
        return foldername in this.files;
    }

    fileExists(foldername, filename) {
        // R - does file exist
        if (!this.folderExists(foldername))
            throw new Error("Folder doesn't exist");
        return filename in this.files[foldername];
    }

    updateFile() {
        // U
        let [foldername, filename] = this.activeFile.split("/");
        this.files[foldername][filename] = this.input.value;
    }

    async renameFolder(foldername, newFoldername) {
        // U - rename folder
        this.files[newFoldername] = this.files[foldername];
        delete this.files[foldername];
        if (foldername === this.activeFile.split("/")[0]) {
            this.activeFile = `${newFoldername}/${
                this.activeFile.split("/")[1]
            }`;
            localStorage.setItem("markright-active", this.activeFile);
        }

        // Update in open folders
        let pos = this.openFolders.indexOf(foldername);
        if (pos !== -1) {
            this.openFolders[pos] = newFoldername;
            localStorage.setItem(
                "markright-open-folders",
                JSON.stringify(this.openFolders)
            );
        }

        this.updateFiletree();

        await fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(this.files)
            })
        });
    }

    async renameFile(location, newFilename) {
        // U - rename file
        let [folder, file] = location.split("/");
        this.files[folder][newFilename] = this.files[folder][file];
        delete this.files[folder][file];
        if (location === this.activeFile) {
            this.activeFile = `${folder}/${newFilename}`;
            localStorage.setItem("markright-active", this.activeFile);
        }

        this.updateFiletree();
        this.updateEditor();

        await fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(this.files)
            })
        });
    }

    async deleteFolder(foldername) {
        // D - delete folder
        if (!this.folderExists(foldername))
            throw new Error("Folder doesn't exist");

        // Remove from storage
        delete this.files[foldername];

        // If file in folder is active, it is no longer active
        if (foldername === this.activeFile.split("/")[0]) {
            this.activeFile = undefined;
            this.input.value = "";
            this.input.readOnly = true;
            this.output.innerHTML = "";
            localStorage.setItem("markright-active", "");
        }

        // Remove from open folders
        let pos = this.openFolders.indexOf(foldername);
        if (pos !== -1) {
            this.openFolders.splice(pos, 1);
            localStorage.setItem(
                "markright-open-folders",
                JSON.stringify(this.openFolders)
            );
        }

        this.updateFiletree();

        await fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(this.files)
            })
        });
    }

    async deleteFile(location) {
        // D - delete specific file
        let [foldername, filename] = location.split("/");
        if (!this.fileExists(foldername, filename))
            throw new Error("Filename doesn't exist");

        // If active, there is no more active
        if (location === this.activeFile) {
            this.activeFile = undefined;
            this.input.value = "";
            this.input.readOnly = true;
            this.output.innerHTML = "";
            localStorage.setItem("markright-active", "");
        }

        // Remove from storage
        delete this.files[foldername][filename];
        this.updateFiletree();

        await fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(this.files)
            })
        });
    }

    updateEditor() {
        // Update the editor if a new file becomes active
        let [foldername, filename] = this.activeFile.split("/");
        this.input.value = this.files[foldername][filename];
        this.input.readOnly = false;
        this.update();
    }

    updateFiletree() {
        this.menu.innerHTML = "";

        for (let folder of Object.keys(this.files)) {
            // Go through each folder, generating the HTML for each
            let self = this;
            let li = document.createElement("li");

            let button = document.createElement("button");
            button.innerText = folder;
            button.addEventListener("contextmenu", function (event) {
                event.preventDefault();
                self.fileContextmenu.style.display = "none";

                // Move folder contextmenu to location of click
                let x = event.clientX,
                    y = event.clientY;
                self.folderContextmenu.style.top = `${y}px`;
                self.folderContextmenu.style.left = `${x}px`;
                self.folderContextmenu.style.display = "block";

                // Set attribute on contextmenu with info on file to be deleted
                self.folderContextmenu.setAttribute(
                    "foldername",
                    this.innerText
                );
            });
            li.appendChild(button);

            let files = document.createElement("ul");
            for (let file of Object.keys(this.files[folder])) {
                let fileLi = document.createElement("li");
                let fileButton = document.createElement("button");
                let location = `${folder}/${file}`;
                fileButton.innerText = file;
                if (location === this.activeFile)
                    fileButton.classList.add("active");
                fileButton.setAttribute("location", location);
                fileButton.addEventListener("click", function (event) {
                    self.setActive(this.getAttribute("location"));
                    self.updateEditor();
                    self.updateFiletree();
                });
                fileButton.addEventListener("contextmenu", function (event) {
                    event.preventDefault();
                    self.folderContextmenu.style.display = "none";

                    // Move file contextmenu to location of click
                    let x = event.clientX,
                        y = event.clientY;
                    self.fileContextmenu.style.top = `${y}px`;
                    self.fileContextmenu.style.left = `${x}px`;
                    self.fileContextmenu.style.display = "block";

                    // Set attribute for delete, etc.
                    self.fileContextmenu.setAttribute("location", location);
                });
                fileLi.appendChild(fileButton);
                files.appendChild(fileLi);
            }

            // Dropdown in file tree
            if (this.openFolders.indexOf(folder) === -1)
                files.style.display = "none";
            button.addEventListener("click", function (event) {
                let pos = self.openFolders.indexOf(this.innerText);
                if (pos === -1) self.openFolders.push(this.innerText);
                else self.openFolders.splice(pos, 1);
                localStorage.setItem(
                    "markright-open-folders",
                    JSON.stringify(self.openFolders)
                );
                self.updateFiletree();
            });

            li.appendChild(files);
            this.menu.appendChild(li);
        }
    }

    update() {
        // ? Notice the use of update() multiple times below in the event listeners. I've observed a couple of interesting things:
        // ? * If I only place update() in keydown, then it bounces and passes in all characters except for the one the user just typed in
        // ? * If I only place update() in input, then Backspace doesn't work
        this.output.innerHTML = parseMarkdown(this.input.value);
        this.output
            .querySelectorAll(".hljs")
            .forEach(element => hljs.highlightElement(element));

        // Save to storage
        this.updateFile();
    }
}

window.onload = () => {
    // Set up Split.js
    Split(["#menu", "#input", "#output"], {
        gutterSize: 3,
        sizes: [14, 43, 43],
        minSize: [200, 400, 400]
    });

    input = document.getElementById("input");
    output = document.getElementById("output");
    menu = document.getElementById("tree");
    folderContextmenu = document.getElementById("folder-contextmenu");
    fileContextmenu = document.getElementById("file-contextmenu");

    input.readOnly = true;
    editor = new Editor(
        input,
        output,
        tree,
        folderContextmenu,
        fileContextmenu
    );

    // * Obviously, storing and comparing state might be more efficient
    input.addEventListener("input", function (event) {
        editor.update();
    });

    input.addEventListener("blur", function (event) {
        fetch("/api/updateFilesystem", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filesystem: JSON.stringify(editor.files)
            })
        });
    });

    let tabs = 0;
    input.addEventListener("keydown", function (event) {
        let start = this.selectionStart;
        let end = this.selectionEnd;

        // Emulate tabbing
        if (event.key === "Tab") {
            event.preventDefault();
            // Set textarea value to text before caret + tab + text after caret
            this.value = `${this.value.substring(
                0,
                start
            )}    ${this.value.substring(end)}`;
            this.selectionStart = this.selectionEnd = start + 4;
            tabs += 4;
        } else if (event.key === "Enter") {
            event.preventDefault();
            // Set textarea value to text before caret + newline + current # of tabs + text after caret
            this.value = `${this.value.substring(0, start)}\n${" ".repeat(
                tabs
            )}${this.value.substring(end)}`;
            this.selectionStart = this.selectionEnd =
                start + "\n".length + tabs;
        } else if (event.key === "Backspace") {
            event.preventDefault();
            let prev = this.value.substring(start - tabs, start);
            if (tabs && prev === " ".repeat(tabs)) {
                // Go back a tab
                tabs -= 4;
                this.value = `${this.value.substring(
                    0,
                    start - 4
                )}${this.value.substring(end)}`;
                this.selectionStart = this.selectionEnd = start - 4;
            } else if (prev != undefined) {
                // Go back as usual
                this.value = `${this.value.substring(
                    0,
                    start - 1
                )}${this.value.substring(end)}`;
                this.selectionStart = this.selectionEnd = start - 1;
            }
            editor.update();
        } else editor.update();
    });

    document.getElementById("new").addEventListener("click", function (event) {
        // New folder
        let folderInput = prompt("Name of folder? ");
        if (folderInput === null) return;
        while (!folderInput || editor.folderExists(folderInput)) {
            folderInput = prompt("Try again. Name of folder?");
            if (folderInput === null) return;
        }

        editor.newFolder(folderInput);
    });

    document
        .getElementById("new-file")
        .addEventListener("click", function (event) {
            // New file
            folderContextmenu.style.display = "none";
            fileContextmenu.style.display = "none";

            // Get folder
            let foldername = folderContextmenu.getAttribute("foldername");
            let filenameInput = prompt("Name of file? ");
            if (filenameInput === null) return;
            while (
                !filenameInput ||
                editor.fileExists(foldername, filenameInput)
            ) {
                filenameInput = prompt("Try again. Name of file? ");
                if (filenameInput === null) return;
            }

            editor.newFile(foldername, filenameInput);
        });

    // Context menus
    document.body.addEventListener("click", function (event) {
        if (
            folderContextmenu.style.display !== "none" &&
            event.target.offsetParent != folderContextmenu
        )
            folderContextmenu.style.display = "none";
        if (
            fileContextmenu.style.display !== "none" &&
            event.target.offsetParent != fileContextmenu
        )
            fileContextmenu.style.display = "none";
    });

    // Delete in folder context menu
    document
        .getElementById("delete-folder")
        .addEventListener("click", function (event) {
            let foldername = this.parentNode.getAttribute("foldername");
            editor.deleteFolder(foldername);
            folderContextmenu.style.display = "none";
        });

    // Rename in folder context menu
    document
        .getElementById("rename-folder")
        .addEventListener("click", function (event) {
            let foldername = this.parentNode.getAttribute("foldername");
            let newFoldername = prompt("Rename folder to what? ");
            if (newFoldername === null) return;
            while (
                !newFoldername.length ||
                editor.folderExists(newFoldername)
            ) {
                newFoldername = prompt("Try again. Rename folder to what? ");
                if (newFoldername === null) return;
            }

            editor.renameFolder(foldername, newFoldername);
            folderContextmenu.style.display = "none";
        });

    // Delete in file context menu
    document
        .getElementById("delete-file")
        .addEventListener("click", function (event) {
            let location = this.parentNode.getAttribute("location");
            editor.deleteFile(location);
            folderContextmenu.style.display = "none";
        });

    // Rename in file context menu
    document
        .getElementById("rename-file")
        .addEventListener("click", function (event) {
            let location = this.parentNode.getAttribute("location");
            let newFilename = prompt("Rename file to what? ");
            if (newFilename === null) return;
            while (
                !newFilename.length ||
                editor.fileExists(location.split("/")[0], newFilename)
            ) {
                newFilename = prompt("Try again. Rename file to what? ");
                if (newFilename === null) return;
            }

            editor.renameFile(location, newFilename);

            fileContextmenu.style.display = "none";
        });

    // Download HTML/Markdown in file context menu
    document
        .getElementById("download-html")
        .addEventListener("click", function (event) {
            let location = this.parentNode.getAttribute("location");
            let a = document.createElement("a");
            a.setAttribute(
                "href",
                `data:text/html;charset=utf-8,${encodeURIComponent(
                    parseMarkdown(editor.getFile(location))
                )}`
            );
            a.setAttribute(
                "download",
                `${location.split("/")[1].split(" ").join("-")}.html`
            );
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            fileContextmenu.style.display = "none";
        });

    document
        .getElementById("download-markdown")
        .addEventListener("click", function (event) {
            let location = this.parentNode.getAttribute("location");
            let a = document.createElement("a");
            a.setAttribute(
                "href",
                `data:text/markdown;charset=utf-8,${encodeURIComponent(
                    editor.getFile(location)
                )}`
            );
            a.setAttribute(
                "download",
                `${location.split("/")[1].split(" ").join("-")}.md`
            );
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            fileContextmenu.style.display = "none";
        });
};

window.onbeforeunload = () => {
    fetch("/api/updateFilesystem", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filesystem: JSON.stringify(editor.files)
        })
    });
};

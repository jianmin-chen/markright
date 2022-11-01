let input, output, menu, contextmenu, editor;

class Editor {
    constructor(input, output, menu, contextmenu) {
        // * Initializing state involves setting up the file tree, the current active file (if any)
        this.input = input;
        this.output = output;
        this.menu = menu;
        this.contextmenu = contextmenu;

        this.files = {};
        this.activeFile;

        // File tree
        this.filetree = [];
        this.filetreeDom = [];

        let files = this.getFiles();
        if (files) {
            // There are files, so let's populate the file tree
            this.files = JSON.parse(files); // Make sure to actually convert to an object!
            this.updateFiletree();

            // Also, make sure to check if there's an active file
            let active = localStorage.getItem("markdown-parser-active");
            if (active) {
                this.activeFile = active;
                this.updateEditor();
            }
        } else {
            // No files, so let's initialize storage
            localStorage.setItem("markdown-parser", "{}");
        }
    }

    setActive(filename) {
        this.activeFile = filename;
        localStorage.setItem("markdown-parser-active", filename);
    }

    newFile(filename) {
        // C
        if (filename in this.files) throw new Error("File already exists");
        this.files[filename] = "";
        localStorage.setItem("markdown-parser", JSON.stringify(this.files));

        // Update the filetree
        this.updateFiletree();

        // Update the editor (set new file to active)
        this.setActive(filename);

        this.updateEditor();
    }

    async getFiles() {
        // R
        return await fetch("/api/getFiles");
    }

    getFile(filename) {
        // R - specific file
        return this.files[filename];
    }

    fileExists(filename) {
        // R - does file exist
        return filename in this.files;
    }

    updateFile() {
        // U
        this.files[this.activeFile] = this.input.value;
        localStorage.setItem("markdown-parser", JSON.stringify(this.files));
    }

    renameFile(oldFilename, newFilename) {
        // U - rename file
        this.files[newFilename] = this.files[oldFilename];
        delete this.files[oldFilename];
        localStorage.setItem("markdown-parser", JSON.stringify(this.files));
        if (oldFilename === this.activeFile) {
            this.activeFile = newFilename;
            localStorage.setItem("markdown-parser-active", this.activeFile);
        }

        // Update in file tree
        this.filetree[this.filetree.indexOf(oldFilename)] = newFilename;
        this.filetreeDom[this.filetreeDom.indexOf(oldFilename)] = newFilename;
        this.menu.querySelectorAll("button").forEach(button => {
            if (button.innerText === oldFilename)
                button.innerText = newFilename;
        });
    }

    deleteFile(filename) {
        // D
        if (!(filename in this.files))
            throw new Error("Filename doesn't exist");

        // If active, there is no more active
        if (filename === this.activeFile) {
            this.activeFile = undefined;
            this.input.value = "";
            this.input.disabled = true;
            this.output.innerHTML = "";
            localStorage.setItem("markdown-parser-active", "");
        }

        // Remove from storage
        delete this.files[filename];
        localStorage.setItem("markdown-parser", JSON.stringify(this.files));

        // Remove from file tree
        this.filetree.splice(this.filetree.indexOf(filename), 1);
        this.filetreeDom.splice(this.filetreeDom.indexOf(filename), 1);
        this.menu.querySelectorAll("button").forEach(button => {
            if (button.innerText === filename) button.remove();
        });
    }

    updateEditor() {
        // Update the editor if a new file becomes active
        this.input.value = this.files[this.activeFile];
        this.input.disabled = false;
        this.update();

        // Make sure to update the highlighted "active" file in the file tree
        this.menu.querySelectorAll("button").forEach(button => {
            if (
                button.innerText !== this.activeFile &&
                button.classList.contains("active")
            )
                button.classList.remove("active");
            else if (
                button.innerText === this.activeFile &&
                !button.classList.contains("active")
            )
                button.classList.add("active");
        });
    }

    updateFiletree() {
        this.filetree = Object.keys(this.files);

        for (let file of this.filetree.filter(
            file => !this.filetreeDom.includes(file)
        )) {
            // Go through each file, generating the HTML for each
            let li = document.createElement("li");
            let button = document.createElement("button");
            button.innerText = escapeHTML(file);

            // Add event listeners
            let self = this;
            button.addEventListener("click", function (event) {
                self.setActive(this.innerText);
                self.updateEditor();
            });
            button.addEventListener("contextmenu", function (event) {
                event.preventDefault();

                // Move contextmenu to location of click
                let x = event.clientX,
                    y = event.clientY;
                self.contextmenu.style.top = `${y}px`;
                self.contextmenu.style.left = `${x}px`;
                self.contextmenu.style.display = "block";

                // Set attribute on contextmenu with info on file to be deleted
                self.contextmenu.setAttribute("filename", this.innerText);
            });

            li.appendChild(button);
            this.menu.appendChild(li);
        }

        this.filetreeDom = this.filetree;
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
    // Check if logged in
    fetch("/loggedIn")
        .then(res => res.json())
        .then(json => {
            console.log(json);
        });

    input = document.getElementById("input");
    output = document.getElementById("output");
    menu = document.getElementById("tree");
    contextmenu = document.getElementById("contextmenu");

    input.disabled = true;
    editor = new Editor(input, output, tree, contextmenu);

    // * Obviously, storing and comparing state might be more efficient
    input.addEventListener("input", function (event) {
        editor.update();
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
        let filenameInput = prompt("Name of file? ");
        if (filenameInput === null) return;
        while (!filenameInput || editor.fileExists(filenameInput)) {
            filenameInput = prompt("Try again. Name of file?");
            if (filenameInput === null) return;
        }

        editor.newFile(filenameInput);
    });

    // Context menu in file tree
    document.body.addEventListener("click", function (event) {
        if (
            contextmenu.style.display !== "none" &&
            event.target.offsetParent != contextmenu
        )
            contextmenu.style.display = "none";
    });

    // Delete in context menu
    document
        .getElementById("delete")
        .addEventListener("click", function (event) {
            let filename = this.parentNode.getAttribute("filename");
            editor.deleteFile(filename);
            contextmenu.style.display = "none";
        });

    // Rename in context menu
    document
        .getElementById("rename")
        .addEventListener("click", function (event) {
            let filename = this.parentNode.getAttribute("filename");
            let newFilename = prompt("Rename file to what? ");
            if (newFilename === null) return;
            while (!newFilename.length || editor.fileExists(newFilename)) {
                newFilename = prompt("Try again. Rename file to what? ");
                if (newFilename === null) return;
            }

            editor.renameFile(filename, newFilename);

            contextmenu.style.display = "none";
        });

    // Download HTML/Markdown in context menu
    document
        .getElementById("download-html")
        .addEventListener("click", function (event) {
            let filename = this.parentNode.getAttribute("filename");
            let a = document.createElement("a");
            a.setAttribute(
                "href",
                `data:text/html;charset=utf-8,${encodeURIComponent(
                    parseMarkdown(editor.getFile(filename))
                )}`
            );
            a.setAttribute("download", `${filename.split(" ").join("-")}.html`);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            contextmenu.style.display = "none";
        });

    document
        .getElementById("download-markdown")
        .addEventListener("click", function (event) {
            let filename = this.parentNode.getAttribute("filename");
            let a = document.createElement("a");
            a.setAttribute(
                "href",
                `data:text/markdown;charset=utf-8,${encodeURIComponent(
                    editor.getFile(filename)
                )}`
            );
            a.setAttribute("download", `${filename.split(" ").join("-")}.md`);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            contextmenu.style.display = "none";
        });
};

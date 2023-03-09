import parseMarkdown from "./parser";

export function downloadHTML(markdown, title = "Untitled") {
    let a = document.createElement("a");
    a.setAttribute(
        "href",
        `data:text/html;charset=utf-8,${encodeURIComponent(
            parseMarkdown(markdown)
        )}`
    );
    a.setAttribute("download", `${title.split(" ").join("-")}.html`);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function downloadMarkdown(markdown, title = "Untitled") {
    let a = document.createElement("a");
    a.setAttribute(
        "href",
        `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`
    );
    a.setAttribute("download", `${title.split(" ").join("-")}.md`);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// PART OF TOKENIZER

const splitBlock = (block, inner = false) => {
    // What we need to process here:
    // :check Italic
    // :check Bold
    // :check Inline code
    // :check Links

    let specialChars = ["*", "`", "[", "~", "^"];
    let fragments = [];

    const takeNormal = () => {
        // Slice up until we reach a special character
        let characters = [];
        let i = 0;
        while (!specialChars.includes(block.charAt(i)) && i < block.length) {
            characters.push(block.charAt(i));
            i++;
        }
        block = block.slice(i);
        return characters.join("");
    };

    const sliceUpTo = (phrase, ignore = false) => {
        // Slice up until we reach a special phrase
        if (block.length) block = block.slice(phrase.length);
        let characters = [];
        let i = 0;
        while (
            block.slice(i, i + phrase.length) != phrase &&
            i < block.length
        ) {
            characters.push(block.charAt(i));
            i++;
        }
        if (block.length) {
            block = block.slice(phrase.length);
            block = block.slice(i);
        }
        if (!ignore) return splitBlock(characters.join("")); // Also tokenize inner parts
        return characters.join(""); // Don't tokenize inner parts. Useful for <code>
    };

    if (!block.length) return [];
    else if (block.startsWith("* ") && !inner)
        // Unordered list item
        return {
            type: "li",
            content: splitBlock(block.slice(2))
        };
    else if (block.search(/[0-9]+\./) === 0)
        // Ordered list item
        return {
            type: "li",
            content: splitBlock(block.slice(block.match(/[0-9]+\./)[0].length))
        };
    else if (block.search(/\- \[[X ]{1}\] /) === 0) {
        // Task list
        let ti = {
            type: "ti",
            content: splitBlock(
                block.slice(block.match(/\- \[[X ]{1}\] /)[0].length)
            ),
            attributes: { checked: false }
        };

        // Check if the task item has been checked off or not
        let tiMatch = block.match(/\- \[[X ]{1}\] /)[0];
        if (tiMatch.includes("X")) ti.attributes.checked = true;
        return ti;
    }

    while (block.length) {
        let curr = block.charAt(0);
        if (curr === "*") {
            // Determine if italic, bold, mix of both, or unordered list
            // ! Not the best way to do it, but I couldn't think of a smarter way. Something in my mind tells me recursion, but I have no idea how to go about it. Clues?
            if (block.length > 2 && block.slice(0, 3) === "***")
                fragments.push({
                    type: "boldItalic",
                    content: sliceUpTo("***")
                });
            else if (block.length > 1 && block.slice(0, 2) === "**")
                fragments.push({ type: "b", content: sliceUpTo("**") });
            else fragments.push({ type: "i", content: sliceUpTo("*") });
        } else if (curr === "`")
            fragments.push({ type: "code", content: sliceUpTo("`", true) });
        else if (curr === "~") {
            // Determine if subscript or strikethrough
            if (block.length > 1 && block.slice(0, 2) === "~~")
                fragments.push({ type: "s", content: sliceUpTo("~~") });
            else fragments.push({ type: "sub", content: sliceUpTo("~") });
        } else if (curr === "^")
            fragments.push({ type: "sup", content: sliceUpTo("^") });
        else if (curr === "[") {
            let fragment = { type: "a", content: sliceUpTo("]") };
            if (block.charAt(0) === "(")
                fragment.attributes = {
                    href: sliceUpTo(")", true),
                    target: "_blank",
                    rel: "noopener noreferrer"
                };
            fragments.push(fragment);
        } else fragments.push({ type: "normal", content: takeNormal() });
    }

    return fragments;
};

const processBlock = (block, i) => {
    // What we need to process here:
    // :check Headings
    // :check Blockquotes
    // :check Code blocks
    // :check Horizontal breaks
    // :check Images
    // :check Unordered and ordered lists
    block = block.trim();
    let type = "p";
    let header = 0;
    let attributes = {};

    if (block === "---") {
        // Horizontal lines
        block = -1; // * -1 represents no content (vs. purposely placed empty string)
        type = "hr";
    } else if (block.startsWith("#")) {
        // Headings
        let fragment = block;
        while (fragment.charAt(0) === "#") {
            fragment = fragment.slice(1);
            header++;
        }

        if (fragment[0] === " ") {
            // No space afterwards != header
            type = `h${header}`;
            block = block.slice(header).trim();

            // All IDs should begin with a letter and may be followed by any number of letters, digits, hyphens, underscores, colons, or periods
            let id = block.replace(/[^a-zA-Z0-9 ]/g, "");
            attributes = {
                id: `h-${i}-${id.toLowerCase().split(" ").join("-")}`
            }; // Give header ID based on header content
        }
    } else if (block.startsWith(">")) {
        // Blockquotes
        block = block.slice(1);
        type = "blockquote";
        block = block.trim();
    } else if (block.startsWith("* "))
        // Unordered list
        return {
            type: "ul",
            content: block.split("\n").flatMap(li => splitBlock(li, false))
        };
    else if (block.search(/[0-9]+\./) === 0)
        // Ordered list
        return {
            type: "ol",
            content: block.split("\n").flatMap(li => splitBlock(li, false))
        };
    else if (block.search(/\- \[[X ]{1}\] /) === 0)
        // Task list
        return {
            type: "tl",
            content: block.split("\n").flatMap(li => splitBlock(li, false))
        };
    else if (block.startsWith("```")) {
        // Code blocks
        block = block.split("\n");
        let lang = block[0].slice(3) || "auto";
        block = block.slice(1, block.length - 1); // Remove last line

        return {
            type: "codeBlock",
            content: block.join("\n"),
            attributes: { lang }
        };
    } else if (
        block.search(/!\[.+\]\(.+\)/) === 0 &&
        block.match(/!\[.+\]\(.+\)/)[0].length === block.length
    ) {
        // Image
        let alt = block.match(/\[.+\]/)[0];
        alt = alt.slice(1, alt.length - 1); // Remove the brackets around alt value
        let src = block.match(/\(.+\)/)[0];
        src = src.slice(1, src.length - 1); // Remove the parentheses around src value
        type = "img";
        block = -1;
        attributes = { alt, src };
    }

    let token = { type, content: block != -1 ? splitBlock(block, false) : -1 };
    if (attributes) token.attributes = attributes;
    return token;
};

// PART OF PARSER

const parse = tokens => {
    if (
        typeof tokens === "string" ||
        (typeof tokens === "number" && tokens === -1)
    )
        return tokens; // * Only a string (user content) or -1 (empty block)
    let result = tokens.map(token => {
        if (token.type === "normal") return token.content; // Strings
        else if (token.type === "code") return tag("code", token.content);
        else if (token.type === "codeBlock")
            return tag("pre", token.content, {
                class: `language-${token.attributes.lang} hljs`
            });
        else if (token.type === "boldItalic")
            return tag("b", [tag("i", parse(token.content))]);
        else if (token.type === "tl")
            // Use unordered list for task list (for accessibility purposes)
            return tag("ul", parse(token.content), {
                class: "tasklist",
                role: "tasklist"
            });
        else if (token.type === "ti")
            // Task list item
            return tag("li", [
                tag("input", -1, {
                    disabled: "",
                    type: "checkbox",
                    ...(token.attributes.checked && { checked: "" })
                }),
                tag("span", parse(token.content))
            ]);
        else
            return tag(
                token.type,
                parse(token.content),
                token.attributes || {}
            );
    });
    return result;
};

const tag = (name, content = [], attributes = {}) => {
    // > The secret to successful HTML generation is to treat your HTML document as a data structure instead of a flat piece of text.
    // > JavaScript's objects provide a very easy way to model this:
    // > var linkObject = { name: "a", attributes: { href: "http://www.gokgs.com" }, content: ["Play Go!"] };
    return { name, content, attributes }; // This is smart because content can be recursive when generating HML.
};

const header = (heading, content) => tag(heading, content);

// PART OF RENDERER

const renderHTML = element => {
    let pieces = [];

    const renderAttributes = attributes => {
        // Convert attributes { href: ... } to escaped strings
        let result = [];
        if (attributes)
            for (let name in attributes)
                result.push(` ${name}="${escapeHTML(attributes[name])}"`);
        return result.join("");
    };

    const render = element => {
        if (typeof element === "string")
            pieces.push(escapeHTML(element)); // Text node
        else if (element.content === -1)
            pieces.push(
                `<${element.name}${renderAttributes(element.attributes)}/>`
            );
        // Empty tag, e.g. <br/>
        else {
            // Tag with content - recursive
            pieces.push(
                `<${element.name}${renderAttributes(element.attributes)}>`
            );
            for (let piece of element.content) render(piece);
            pieces.push(`</${element.name}>`);
        }
    };

    render(element);
    return pieces.join("");
};

const parseMarkdown = markdown => {
    // MAIN WRAPPER FUNCTION
    // :check 1. Split the file into paragraphs by cutting it at every empty line.
    // :check 2. Remove the "#" characters from header paragraphs and mark them as headers.
    // :check 3. Process the text of the paragraphs themselves, splitting them into normal parts and the other Markdown stuff.
    // :check 4. Wrap each piece into the correct HTML tags.
    // :check 5. Combine everything into a single HTML document.

    let blocks = markdown.split("\n");
    let fragments = [];

    let inCodeBlock = false;
    let codeFragments = [];
    let olFragments = [];
    let ulFragments = [];
    let tlFragments = [];
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        let ulRegex = block.length ? block.search(/\* /) : -1;
        if (!(ulRegex === 0) && ulFragments.length) {
            // End of unordered list
            fragments.push(ulFragments.join("\n"));
            ulFragments = [];
        }

        let olRegex = block.length ? block.search(/[0-9]+\./) : -1;
        if (!(olRegex === 0) && olFragments.length) {
            // End of ordered list
            fragments.push(olFragments.join("\n"));
            olFragments = [];
        }

        let tlRegex = block.length ? block.search(/\- \[[X ]{1}\] /) : -1;
        if (!(tlRegex === 0) && tlFragments.length) {
            // End of task list
            fragments.push(tlFragments.join("\n"));
            tlFragments = [];
        }

        if (!block.length && !inCodeBlock) continue; // Newline

        if (block.startsWith("```")) {
            if (inCodeBlock) {
                // Exit code block
                codeFragments.push(block);
                fragments.push(codeFragments.join("\n"));
                codeFragments = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeFragments.push(block);
            }
        } else if (inCodeBlock) codeFragments.push(block);
        else if (ulRegex === 0) ulFragments.push(block);
        else if (olRegex === 0) olFragments.push(block);
        else if (tlRegex === 0) tlFragments.push(block);
        else fragments.push(block);
    }

    if (ulFragments.length)
        fragments.push(ulFragments.join("\n")); // End of unordered list
    else if (olFragments.length)
        fragments.push(olFragments.join("\n")); // End of unordered list
    else if (tlFragments.length) fragments.push(tlFragments.join("\n")); // End of task list

    let wrapper = tag("div"); // Contains the output
    for (let i = 0; i < fragments.length; i++)
        wrapper.content.push(processBlock(fragments[i], i));
    wrapper.content = parse(wrapper.content);
    return renderHTML(wrapper);
};

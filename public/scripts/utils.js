const escapeHTML = text => {
    // > When we have created a document, it will have to be reduced to a string.
    // > But building this string from the data structures we have been producing is very straightforward. The important thing is to remember to transform the special characters in the text of our document.
    let replacements = [
        [/&/g, "&amp;"], // Match all ampersands
        [/"/g, "&quot;"], // Match all quotes
        [/</g, "&lt;"], // Match all <
        [/>/g, "&gt;"] // Match all >
    ];

    for (let special of replacements)
        text = text.replace(special[0], special[1]);

    return text;
};

Code snippets that I wrote than removed for implementation at a later date.

## Synchronized scroll

```
ref={output}
onMouseEnter={() => setOutputScroll(true)}
onMouseLeave={() => setOutputScroll(false)}
onScroll={event => {
    if (outputScroll && input.current) {
        let editor = input.current.editor;
        if (event.target.scrollTop === 0)
            editor.session.setScrollTop(-32);
        // Account for padding
        else {
            const scrollTop = event.target.scrollTop;
            const height = event.target.scrollHeight;
            let scrollProportion = scrollTop / height;
            editor.session.setScrollTop(
                editor.renderer.layerConfig.maxHeight *
                    scrollProportion
            );
        }
    }
}}
```

```
onScroll={(scrollTop, height) => {
    if (!outputScroll) {
        let outputDiv = output.current;
        if (outputDiv) {
            let scrollProportion =
                scrollTop / height;
            if (scrollProportion < 0)
                scrollProportion = 0; // Clamp
            outputDiv.scrollTop =
                outputDiv.scrollHeight *
                scrollProportion;

            if (
                scrollTop +
                    outputDiv.offsetHeight ===
                height
            )
                outputDiv.scrollTop =
                    outputDiv.scrollHeight;
        }
    }
}}
```

Final TODO:

* Make sure filesystem stuff works and updates with the tabs. That's it. Ignore all other minor issues right now.
* Rate limiting
* Rewrite Markdown parser
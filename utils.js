const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

if (require.main === module) {
    // Run Prettier on .ejs files by temporarily renaming them
    const viewDir = path.join(__dirname, "views");
    fs.readdir(viewDir, (err, data) => {
        if (err) console.error(err);
        for (let view of data) {
            // Rename view
            fs.rename(
                path.join(viewDir, view),
                path.join(viewDir, view.replace("ejs", "html")),
                err => {
                    if (err) console.error(err);
                }
            );
        }
        exec("npm run format", (err, stdout, stderr) => {
            if (err) console.error(err);
            // Rename views
            for (let view of data) {
                fs.rename(
                    path.join(viewDir, view.replace("ejs", "html")),
                    path.join(viewDir, view),
                    err => {
                        if (err) console.error(err);
                    }
                );
            }
            console.log("Done formatting");
        });
    });
}

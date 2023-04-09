import { Button } from "../../../components/ui/Button";
import parseMarkdown from "../../../utils/parser";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { useEffect } from "react";

export default function Slug({ username, markdown }) {
    useEffect(() => {
        document.querySelectorAll(".prose pre").forEach(el => {
            if (!el.querySelector("span")) hljs.highlightElement(el);
        });
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-end gap-y-4 bg-neutral-100 pt-4">
            <Button
                disabled
                variant="outline"
                className=" rounded-3xl bg-white px-14 py-1.5 shadow-lg hover:bg-white">
                Shared by {username}
            </Button>
            <div
                className="prose prose-lg w-7/12 max-w-none overflow-auto rounded-t-3xl border bg-white p-14 shadow-2xl"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const { id, slug } = query;
    const mongoose = require("mongoose");
    const dbConnect = require("../../../database/connect").default;
    const User = (await require("../../../database/services/user.service"))
        .default;
    const { get } = require("../../../database/aws/aws");

    const search = (filesystem, file) => {
        let results = [];
        for (let f of filesystem) {
            if (f.type === "folder") results.push(search(f.content, file));
            else if (f.isPublic && f.storage.replace(".md", "") === file)
                return f;
        }
        return results.filter(f => !Array.isArray(f));
    };

    try {
        await dbConnect();
        const user = await User.findOne({
            _id: new mongoose.Types.ObjectId(id)
        });
        console.log(user);
        if (user) {
            // Go through user's files, find public files
            const content = search(user.filesystem, slug);
            if (!content) return { notFound: true };
            return {
                props: {
                    username: user.name,
                    markdown: await get(content[0].storage)
                }
            };
        } else return { notFound: true };
    } catch {
        return { notFound: true };
    }
}

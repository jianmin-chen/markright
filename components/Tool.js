import { Textarea } from "./ui/Textarea";

export default function Tool({ name }) {
    switch (name) {
        case "ChatGPT":
            return (
                <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center backdrop-blur-sm">
                    <div className="prose prose-lg z-[998] rounded-md border-neutral-200 bg-white p-8 shadow-sm">
                        <form>
                            <textarea
                                className="w-full rounded-md border-neutral-200 p-4"
                                placeholder="Write a tagline"
                                rows="10"
                            />
                        </form>
                    </div>
                </div>
            );
    }
}

export let tools = ["ChatGPT"];

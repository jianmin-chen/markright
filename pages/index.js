import { Button } from "../components/ui/Button";

export default function Index() {
    return (
        <div className="max-w-screen relative h-screen max-h-screen w-screen overflow-hidden">
            <img
                className="min-w-screen relative z-[-1] min-h-screen"
                src="/images/screenshot.png"
            />
            <div className="absolute top-2 left-2 rounded-lg border border-neutral-600 bg-neutral-800 p-14 text-neutral-200 shadow-2xl">
                <div className="relative"></div>
                <div className="flex flex-col gap-y-7">
                    <h1 className="text-2xl">
                        <code>markright</code> is a minimal, Markdown-based
                        writing tool.
                    </h1>
                    <Button>Log in with Google</Button>
                </div>
            </div>
        </div>
    );
}

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { Toaster } from "../components/ui/Toaster";
import "../styles/globals.scss";

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

export default function App({
    Component,
    pageProps: { session, ...pageProps }
}) {
    return (
        <SessionProvider session={session}>
            <DndProvider backend={HTML5Backend}>
                <div className={inter.className}>
                    <Component {...pageProps} />
                    <Toaster />
                </div>
            </DndProvider>
        </SessionProvider>
    );
}

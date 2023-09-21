import { Toaster } from "../components/ui/Toaster";
import "../styles/globals.scss";
import { post } from "../utils/fetch";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
                <div className={`${inter.className} ${inter.variable}`}>
                    <Component {...pageProps} />
                    <Toaster />
                </div>
            </DndProvider>
        </SessionProvider>
    );
}

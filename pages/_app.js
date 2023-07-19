import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { Toaster } from "../components/ui/Toaster";
import { useEffect, useState } from "react";
import ThemeContext from "../components/ThemeContext";
import "../styles/globals.scss";

const inter = Inter({
    variable: "--sans",
    subsets: ["latin"]
});

export default function App({
    Component,
    pageProps: { session, ...pageProps }
}) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        if (window.localStorage.getItem("theme")) {
            setTheme(window.localStorage.getItem("theme"));
            document
                .querySelector("html")
                .classList.add(window.localStorage.getItem("theme"));
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("theme", theme);
        document
            .querySelector("html")
            .classList.remove(theme === "light" ? "dark" : "light");
        document.querySelector("html").classList.add(theme);
    }, [theme]);

    return (
        <SessionProvider session={session}>
            <DndProvider backend={HTML5Backend}>
                <ThemeContext.Provider value={{ theme, setTheme }}>
                    <div className={inter.className}>
                        <Component {...pageProps} />
                        <Toaster />
                    </div>
                </ThemeContext.Provider>
            </DndProvider>
        </SessionProvider>
    );
}

import styles from "./Loader.module.scss";

export default function Loader() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className={styles.spinner}>
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
                <div className="bg-black dark:bg-gray-300" />
            </div>
        </div>
    );
}

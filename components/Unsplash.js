import { get, post } from "../utils/fetch";
import { useEffect, useState, useRef } from "react";

export default function Unsplash({ setBackground }) {
    const [query, setQuery] = useState("");
    const [currPage, setCurrPage] = useState(1);
    const [photos, setPhotos] = useState([]);
    const container = useRef(null);

    const onScroll = () => {
        if (container.current) {
            const { scrollTop, scrollHeight, clientHeight } = container.current;
            if (scrollTop + clientHeight === scrollHeight) {
                // Make API call for next page
                const page = currPage;
                setCurrPage(prev => prev + 1);
                get({
                    route: "/api/unsplash",
                    data: { query, page: page + 1 }
                }).then(json => {
                    setPhotos(prev => [...prev, ...json.results.results]);
                });
            }
        }
    };

    const setPhoto = uri => {
        if (uri) {
            post({
                route: "/api/unsplash",
                data: { data: uri }
            }).then(json => {
                setBackground(uri);
            });
        }
    };

    useEffect(() => {
        // Grab first page photos
        if (query.length) {
            setCurrPage(1);
            get({
                route: "/api/unsplash",
                data: { query }
            }).then(json => {
                setPhotos(json.results.results);
            });
        }
    }, [query]);

    return (
        <div
            className="relative max-h-[75vh] overflow-auto"
            onScroll={onScroll}
            ref={container}>
            <input
                className="sticky top-0 mb-0.5 w-full rounded-md bg-neutral-100 py-2 px-3 dark:bg-neutral-700 dark:placeholder:text-neutral-500"
                placeholder="Search Unsplash"
                onChange={event => setQuery(event.target.value)}
            />
            <div className="mt-1 flex flex-col gap-y-1 p-1">
                {photos.map(img => (
                    <button
                        key={img.id}
                        onClick={() => setPhoto(img.links.download)}>
                        <img
                            className="max-w-[300px]"
                            key={img.id}
                            src={img.links.download}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

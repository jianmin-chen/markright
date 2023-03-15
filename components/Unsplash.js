import { get } from "../utils/fetch";
import { useState } from "react";

export default function Unsplash() {
    const [photos, setPhotos] = useState([]);

    const search = event => {
        const query = event.target.value;
        if (query) {
            get({
                route: "/api/unsplash",
                data: { query }
            }).then(json => {
                console.log(json.results);
                setPhotos(json.results.results);
            });
        }
    };

    const setPhoto = uri => {
        if (uri) {
            post({
                route: "/api/"
            });
        }
    };

    return (
        <div className="relative max-h-[75vh] overflow-auto">
            <input
                className="w-full bg-neutral-100 py-2 px-3 mb-0.5 sticky top-0"
                placeholder="Search Unsplash"
                onChange={search}
            />
            <div className="flex flex-col gap-y-1 p-1">
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

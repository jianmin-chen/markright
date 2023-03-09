export const encodeQuery = data => {
    let res = [];
    for (let key of Object.keys(data)) {
        res.push(`${key}=${data[key]}`);
    }
    return res.length ? `?${res.join("&")}` : "";
};

export const get = async ({ route, data = {} }) =>
    new Promise((resolve, reject) =>
        fetch(encodeURI(route + encodeQuery(data)))
            .then(res => res.json())
            .then(res => {
                if (!res.success) return reject(res.reason);
                resolve(res);
            })
            .catch(err => reject(err.message))
    );

export const post = async ({ route, data = {} }) =>
    new Promise((resolve, reject) =>
        fetch(route, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) return reject(res.reason);
                resolve(res);
            })
            .catch(err => reject(err.message))
    );

// Same as a POST request, but we use PATCH instead
export const patch = async ({ route, data = {} }) =>
    new Promise((resolve, reject) =>
        fetch(route, {
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) return reject(res.reason);
                resolve(res);
            })
            .catch(err => reject(err.message))
    );

export const del = async ({ route, data = {} }) =>
    new Promise((resolve, reject) =>
        fetch(route, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) return reject(res.reason);
                resolve(res);
            })
            .catch(err => reject(err.message))
    );

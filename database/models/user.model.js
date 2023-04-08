import mongoose from "mongoose";
import seedrandom from "seedrandom";
import { v4 as uuid } from "uuid";
import { encrypt, decrypt } from "../../utils/filesystem";
import { upload, get, crypt, del } from "../aws/aws";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    background: {
        type: String,
        required: true,
        trim: true,
        default:
            "https://images.unsplash.com/photo-1533470192478-9897d90d5461?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2135&q=80"
    },
    editorSettings: {
        type: Object
    },
    filesystem: {
        type: [
            {
                type: Object
            }
        ],
        default: []
    }
});

userSchema.methods.decryptObj = function (arr, password, options = {}) {
    const decrypted = [];
    for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        if (f.type === "file") {
            let filtered = f;
            if (options.safe) delete filtered.storage;
            decrypted.push({
                ...filtered,
                name: decrypt(f.name, password)
            });
        }
        // { name, type, content }
        else
            decrypted.push({
                type: "folder",
                name: decrypt(f.name, password),
                content: this.decryptObj(f.content, password, options)
            });
    }
    return decrypted;
};

userSchema.methods.addFolder = async function (location, password) {
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        // Directly push
        if (decrypted.find(x => x.type === "folder" && x.name === location))
            throw new Error(`${location} already exists`);
        this.filesystem.push({
            type: "folder",
            name: encrypt(location, password),
            content: []
        });
        return await this.save();
    }
    let encrypted = this.filesystem;
    // Traverse down filesystem, adding file where it needs to be
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let step;
        let location = decrypted.filter((x, index) => {
            if (x.name === route) {
                if (x.type === "file") return false;
                step = index;
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
        encrypted = encrypted[step];
    }

    if (
        !decrypted.content.find(
            x => x.type === "folder" && x.name === traverse[traverse.length - 1]
        )
    )
        encrypted.content.push({
            type: "folder",
            name: encrypt(traverse[traverse.length - 1], password),
            content: []
        });
    else
        throw new Error(
            `Folder ${traverse[traverse.length - 1]} already exists`
        );

    // Using mutator so need to update
    this.markModified("filesystem");
    return await this.save();
};

userSchema.methods.renameFolder = async function (
    oldLocation,
    newLocation,
    password
) {};

userSchema.methods.deleteFolder = async function (location, password) {};

userSchema.methods.addFile = async function (location, password, content = "") {
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        if (decrypted.find(x => x.type === "file" && x.name === location))
            throw new Error(`${location} already exists`);
        const storage =
            Math.abs(seedrandom(`${this._id}${location}`).int32()) + ".md";
        await upload(storage, content);
        this.filesystem.push({
            type: "folder",
            name: encrypt(location, password),
            isPublic: false,
            storage
        });
        return await this.save();
    }
    let encrypted = this.filesystem;
    // Traverse down filesystem, adding file where it needs to be
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let step;
        let location = decrypted.filter((x, index) => {
            if (x.name === route) {
                if (x.type === "file") return false;
                step = index;
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
        encrypted = encrypted[step];
    }

    if (
        !decrypted.content.find(
            x => x.type === "file" && x.name === traverse[traverse.length - 1]
        )
    ) {
        // Create new file in AWS
        const storage =
            Math.abs(seedrandom(`${this._id}${location}`).int32()) + ".md";
        await upload(storage, content);
        encrypted.content.push({
            type: "file",
            name: encrypt(traverse[traverse.length - 1], password),
            isPublic: false,
            storage
        });
    } else
        throw new Error(`File ${traverse[traverse.length - 1]} already exists`);

    // Using mutator so need to update
    this.markModified("filesystem");
    return await this.save();
};

userSchema.methods.getFile = async function (location, password) {
    // Traverse down filesystem, getting file from AWS and getting it when found
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        const index = decrypted.find(x => x.type === "file" && x === location);
        if (!index) throw new Error(`${location} not found`);
        const content = await get(decrypted[index].storage);
        return decrypt(content, password);
    }
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let location = decrypted.filter(x => {
            if (x.name === route) {
                if (x.type === "file") return false;
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
    }

    const index = decrypted.content.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0)
        throw new Error(`File ${traverse[traverse.length - 1]} doesn't exist`);
    const content = await get(decrypted.content[index].storage);
    if (!content) return "";
    return decrypt(content, password);
};

userSchema.methods.getFileMeta = async function (location, password) {
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        const index = decrypted.find(x => x.type === "file" && x === location);
        if (!index) throw new Error(`${location} not found`);
        return this.filesystem[index];
    }
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let location = decrypted.filter(x => {
            if (x.name === route) {
                if (x.type === "file") return false;
                return true;
            }
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
    }

    const file = decrypted.content.find(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (!index)
        throw new Error(`File ${traverse[traverse.length - 1]} doesn't exist`);
    return file;
};

userSchema.methods.renameFile = async function (
    oldLocation,
    newLocation,
    password
) {
    const content = this.getFile(oldLocation, password);
    await this.deleteFile(oldLocation, password);
    await this.addFile(newLocation, password, content);
    await this.getFileMeta(newLocation, password);
};

userSchema.methods.updateFile = async function (location, content, password) {
    // Traverse down filesystem, updating file in AWS
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        const index = decrypted.find(x => x.type === "file" && x === location);
        if (!index) throw new Error(`${location} not found`);
        return await upload(
            decrypted[index].storage,
            encrypt(content, password)
        );
    }
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let location = decrypted.filter(x => {
            if (x.name === route) {
                if (x.type === "file") return false;
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
    }

    const index = decrypted.content.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0)
        throw new Error(`File ${traverse[traverse.length - 1]} doesn't exist`);
    return await upload(
        decrypted.content[index].storage,
        encrypt(content, password)
    );
};

userSchema.methods.deleteFile = async function (location, password) {
    // Traverse down filesystem, deleting and unlinking file
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        const index = decrypted.findIndex(
            x => x.type === "file" && x === location
        );
        if (index < 0) throw new Error(`File ${location} not found`);
        await del(this.filesystem[index].storage);
        this.filesystem.splice(index, 1);
        return await this.save();
    }
    let encrypted = this.filesystem;
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let step;
        let location = decrypted.filter((x, index) => {
            if (x.name === route) {
                if (x.type === "file") return false;
                step = index;
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
        encrypted = encrypted[step];
    }
    const index = decrypted.content.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0) throw new Error(`File ${location} doesn't exist`);
    await del(encrypted.content[index].storage);
    encrypted.content.splice(index, 1);
    this.markModified("filesystem");
    return await this.save();
};

userSchema.methods.toggleFilePublic = async function (
    location,
    isPublic,
    password
) {
    // Traverse down filesystem, making file public
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        const index = decrypted.findIndex(
            x => x.type === "file" && x === location
        );
        if (index < 0) throw new Error(`File ${location} not found`);
        if (this.filesystem[index].isPublic === isPublic) return this;
        this.filesystem[index].isPublic = isPublic;
        // If isPublic, decrypt content, otherwise encrypt content at location
        if (isPublic)
            await crypt(this.filesysem[index].storage, "decrypt", password);
        else await crypt(this.filesystem[index].storage, "encrypt", password);
        return await this.save();
    }
    let encrypted = this.filesystem;
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let step;
        let location = decrypted.filter((x, index) => {
            if (x.name === route) {
                if (x.type === "file") return false;
                step = index;
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        decrypted = location[0];
        encrypted = encrypted[step];
    }
    // Now get the file in encrypted
    const index = decrypted.content.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0) throw new Error(`File ${location} doesn't exist`);
    if (encrypted.content[index].isPublic === isPublic) return this;
    encrypted.content[index].isPublic = isPublic;
    this.markModified("filesystem");
    // If isPublic, decrypt content, otherwise encrypt content at location
    if (isPublic)
        await crypt(encrypted.content[index].storage, "decrypt", password);
    else await crypt(encrypted.content[index].storage, "encrypt", password);
    return await this.save();
};

module.exports = mongoose.models.user || mongoose.model("user", userSchema);

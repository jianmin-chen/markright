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
    name: {
        type: String,
        required: true,
        trim: true
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

userSchema.methods.setBackground = async function (data) {
    this.background = data;
    return await this.save();
};

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
    // Traverse down filesystem, adding folder where it needs to be
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
        decrypted = location[0].content;
        encrypted = encrypted[step].content;
    }

    if (
        !decrypted.find(
            x => x.type === "folder" && x.name === traverse[traverse.length - 1]
        )
    )
        encrypted.push({
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

userSchema.methods.moveFolder = async function (
    oldLocation,
    newLocation,
    password
) {
    // High cost currently... because you have to rename all the internal folders and such
    let decrypted = this.decryptObj(this.filesystem, password);
    if (oldLocation.split("/").length === 1) {
        const index = decrypted.findIndex(
            x => x.type === "folder" && x.name === oldLocation
        );
        if (index < 0) throw new Error(`Folder ${oldLocation} not found`);
        // Create new folder first, then move all content in old corresponding folder to new folder before deleting
        await this.addFolder(newLocation, password);
        for (let f of decrypted[index].content) {
            if (f.type === "folder")
                await this.moveFolder(
                    oldLocation + "/" + f.name,
                    newLocation + "/" + f.name,
                    password
                );
            else
                await this.moveFile(
                    oldLocation + "/" + f.name,
                    newLocation + "/" + f.name,
                    password
                );
        }
        this.deleteFolder(oldLocation, password);
        return this;
    }
    const traverse = oldLocation.split("/");
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
        decrypted = location[0].content;
        encrypted = encrypted[step].content;
    }
    const index = decrypted.findIndex(
        x => x.type === "folder" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0) throw new Error(`File ${location} doesn't exist`);
    await this.addFolder(newLocation, password);
    for (let f of decrypted[index].content) {
        if (f.type === "folder")
            await this.moveFolder(
                oldLocation + "/" + f.name,
                newLocation + "/" + f.name,
                password
            );
        else
            await this.moveFile(
                oldLocation + "/" + f.name,
                newLocation + "/" + f.name,
                password
            );
    }
    this.deleteFolder(oldLocation, password);
    return this;
};

userSchema.methods.deleteFolder = async function (location, password) {
    // Traverse down filesystem, deleting folder and deleting everything in folder as well
    const traverse = location.split("/");
    let decrypted = this.decryptObj(this.filesystem, password);
    if (traverse.length === 1) {
        const index = decrypted.findIndex(
            x => x.type === "folder" && x.name === location
        );
        if (index < 0) throw new Error(`Folder ${location} not found`);
        for (let f of decrypted[index].content) {
            if (f.type === "folder")
                this.deleteFolder(location + "/" + f.name, password);
            else this.deleteFile(location + "/" + f.name, password);
        }
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
        decrypted = location[0].content;
        encrypted = encrypted[step].content;
    }
    const index = decrypted.findIndex(
        x => x.type === "folder" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0) throw new Error(`File ${location} doesn't exist`);
    for (let f of decrypted[index].content) {
        if (f.type === "folder")
            await this.deleteFolder(location + "/" + f.name, password);
        else await this.deleteFile(location + "/" + f.name, password);
    }
    encrypted.splice(index, 1);
    this.markModified("filesystem");
    return await this.save();
};

userSchema.methods.addFile = async function (
    location,
    password,
    content = "",
    extras = {}
) {
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
            storage,
            ...extras
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
        decrypted = location[0].content;
        encrypted = encrypted[step].content;
    }

    if (
        !decrypted.find(
            x => x.type === "file" && x.name === traverse[traverse.length - 1]
        )
    ) {
        // Create new file in AWS
        const storage =
            Math.abs(seedrandom(`${this._id}${location}`).int32()) + ".md";
        await upload(storage, content);
        encrypted.push({
            type: "file",
            name: encrypt(traverse[traverse.length - 1], password),
            isPublic: false,
            storage,
            ...extras
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
        if (decrypted[index].isPublic) return content;
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
        decrypted = location[0].content;
    }

    const index = decrypted.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0)
        throw new Error(`File ${traverse[traverse.length - 1]} doesn't exist`);
    const content = await get(decrypted[index].storage);
    if (decrypted[index].isPublic) return content;
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
        decrypted = location[0].content;
    }

    const index = decrypted.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0)
        throw new Error(`File ${traverse[traverse.length - 1]} doesn't exist`);
    return decrypted[index];
};

userSchema.methods.moveFile = async function (
    oldLocation,
    newLocation,
    password
) {
    const content = await this.getFile(oldLocation, password);
    const oldFile = await this.getFileMeta(oldLocation, password);
    await this.deleteFile(oldLocation, password);
    if (oldFile.isPublic)
        await this.addFile(newLocation, password, content, {
            isPublic: true,
            publicName:
                newLocation.split("/")[newLocation.split("/").length - 1]
        });
    else await this.addFile(newLocation, password, encrypt(content, password));
    return this;
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
            decrypted[index].isPublic ? content : encrypt(content, password)
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
        decrypted = location[0].content;
    }

    const index = decrypted.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0)
        throw new Error(`File ${traverse[traverse.length - 1]} doesn't exist`);
    return await upload(
        decrypted[index].storage,
        decrypted[index].isPublic ? content : encrypt(content, password)
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
        decrypted = location[0].content;
        encrypted = encrypted[step].content;
    }
    const index = decrypted.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0) throw new Error(`File ${location} doesn't exist`);
    await del(encrypted[index].storage);
    encrypted.splice(index, 1);
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
        if (isPublic) {
            this.filesystem[index].publicName = decrypt(
                this.filesystem[index].name,
                password
            );
            await crypt(this.filesysem[index].storage, "decrypt", password);
        } else {
            delete this.filesysem[index].publicName;
            await crypt(this.filesystem[index].storage, "encrypt", password);
        }
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
        decrypted = location[0].content;
        encrypted = encrypted[step].content;
    }
    // Now get the file in encrypted
    const index = decrypted.findIndex(
        x => x.type === "file" && x.name === traverse[traverse.length - 1]
    );
    if (index < 0) throw new Error(`File ${location} doesn't exist`);
    if (encrypted[index].isPublic === isPublic) return this;
    encrypted[index].isPublic = isPublic;
    this.markModified("filesystem");
    // If isPublic, decrypt content, otherwise encrypt content at location
    if (isPublic) {
        encrypted[index].publicName = decrypt(encrypted[index].name, password);
        await crypt(encrypted[index].storage, "decrypt", password);
    } else {
        delete encrypted[index].publicName;
        await crypt(encrypted[index].storage, "encrypt", password);
    }
    return await this.save();
};

module.exports = mongoose.models.user || mongoose.model("user", userSchema);

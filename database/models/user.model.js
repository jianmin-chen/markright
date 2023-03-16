import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { encrypt, decrypt } from "../../utils/filesystem";

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

userSchema.methods.decryptObj = function (arr, password) {
    const decrypted = [];
    for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        if (f.type === "file")
            decrypted.push({
                ...f,
                name: decrypt(f.name, password)
            });
        // { name, type, content }
        else
            decrypted.push({
                type: "folder",
                name: decrypt(f.name, password),
                content: this.decryptObj(f.content, password)
            });
    }
    return decrypted;
};

userSchema.methods.addFolder = async function (location, password) {
    const traverse = location.split("/");
    if (traverse.length === 1) {
        // Directly push
        this.filesystem.push({
            type: "folder",
            name: Buffer.from(encrypt(location, password)),
            content: []
        });
        return await this.save();
    }
    let encrypted = this.filesystem;
    let decrypted = this.decryptObj(this.filesystem, password);
    // Traverse down filesystem, adding file where it needs to be
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let step;
        let location = filesystem.filter((x, index) => {
            if (x.name === route) {
                if (x.type === "file") throw new Error(`${route} is a file`);
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

    // Using mutator so need to update
    this.markModified("filesystem");
    return await this.save();
};

userSchema.methods.addFile = async function (location, password) {};

userSchema.methods.getFile = async function (location, secret) {
    // Traverse down filesystem, getting file from AWS and getting it when found
};

userSchema.methods.updateFile = async function (location, secret, content) {
    // Traverse down filesystem, updating file in AWS
};

userSchema.methods.deleteFile = async function (location) {
    // Traverse down filesystem, deleteing and unlinking file
};

module.exports = mongoose.models.user || mongoose.model("user", userSchema);

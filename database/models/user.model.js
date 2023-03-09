import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

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
    filesystem: {
        type: [
            {
                type: Object
            }
        ],
        default: []
    }
});

userSchema.methods.addFolder = async function (location) {
    const traverse = location.split("/");
    if (traverse.length === 1) {
        // Directly push, only if doesn't exist yet
        if (
            this.filesystem.find(
                x => x.type === "folder" && x.name === location
            )
        )
            return {
                success: false,
                reason: `Folder ${location} already exists`
            };
        this.filesystem.push({
            type: "folder",
            name: location,
            content: []
        });
        await this.save();
        return { success: true };
    }
    let filesystem = this.filesystem;
    let steps = [];
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let location = filesystem.filter((x, index) => {
            if (x.name === route) {
                if (x.type === "file")
                    return { success: false, reason: `${route} is a file` };
                steps.push(index);
                return true;
            }
            return false;
        });
        if (!location.length)
            return { success: false, reason: `Folder ${route} not found` };
        filesystem = location;
    }
    console.log(steps);
    return { success: true };
};

userSchema.methods.addFile = async function (location) {
    // Traverse down filesystem, adding file where it needs to be
    const traverse = location.split("/");
    if (traverse.length === 1) {
        // Directly push
        if (this.filesystem.find(x => x.type === "file" && x.name === location))
            throw new Error(`File ${location} already exists`);
        this.filesystem.push({
            type: "file",
            name: location,
            content
        });
        return await this.save();
    }
    let filesystem = this.filesystem;
    for (let i = 0; i < traverse.length - 1; i++) {
        let route = traverse[i];
        let location = filesystem.filter(x => {
            if (x.name === route) {
                if (x.type === "file") throw new Error(`${route} is a file`);
                return true;
            }
            return false;
        });
        if (!location.length) throw new Error(`Folder ${route} not found`);
        filesystem = location[0];
    }

    // Create file in AWS
    let id = uuid();
    while (await exists(`${id}.md`)) {
        // Keep generating unique IDs
        id = uuid();
    }

    await upload(`${id}.md`, "");

    filesystem.content.push({
        type: "file",
        name: traverse[traverse.length - 1],
        content: `${id}.md`
    });

    // Using mutator so need to update
    this.markModified("filesystem");
    return await this.save();
};

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

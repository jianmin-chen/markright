import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
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

userSchema.methods.addFile = async function (location) {
    // Traverse down filesystem, adding file where it needs to be
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

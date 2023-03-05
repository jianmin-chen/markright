import User from "../models/user.model";

class UserService {
    async create(data) {
        return await User.create(data);
    }

    async findOne(query) {
        return await User.findOne(query);
    }
}

export default new UserService();

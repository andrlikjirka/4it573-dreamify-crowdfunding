import {User} from "../model/user.model.js";

export const findAllUsers = async () => {
    const users = await User.find(
        {deleted: false},
        {},
        {});

    return users;
}

export const getUserById = async (id, blocked = false, deleted = false) => {
    const user = await User.findOne(
        {_id: id, blocked: blocked, deleted: deleted},
        {},
        {});
    return user;
};

export const getUserByEmail = async (email, blocked = false, deleted = false) => {
    const user = await User.findOne(
        {email: email, blocked: blocked, deleted: deleted},
        {},
        {});
    return user;
};
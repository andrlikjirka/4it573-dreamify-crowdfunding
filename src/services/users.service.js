import {User} from "../model/user.model.js";
import bcrypt from "bcrypt";

export const findAllUsers = async () => {
    const users = await User.find(
        {deleted: false},
        {},
        {});

    return users;
}

export const getUserById = async (id) => {
    const user = await User.findOne(
        {_id: id},
        {},
        {});
    return user;
};


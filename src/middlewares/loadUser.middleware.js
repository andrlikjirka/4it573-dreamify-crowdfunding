import jwt from "jsonwebtoken";
import {User} from "../model/user.model.js";

export default async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.user = null;
        return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    try {
        const user = await User.findOne({_id: decoded.userId}, {}, {});
        if (!user) return next();
        res.locals.user = {
            id: user._id,
            name: user.name,
            role: user.role
        };
    } catch (err) {
        console.error(err.message);
        return next(err);
    }
    next();
};
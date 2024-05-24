import jwt from "jsonwebtoken";
import {User} from "../model/user.model.js";

export default async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.userIdentity = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({_id: decoded.userId}, {}, {});
        if (!user) return next();
        res.locals.userIdentity = {
            id: user._id.toString(),
            name: user.name,
            role: user.role
        };
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.locals.userIdentity = null; // if token cannot be decoded, logout user
            return next();
        }
        console.error(err.message);
        return next(err);
    }
    next();
};
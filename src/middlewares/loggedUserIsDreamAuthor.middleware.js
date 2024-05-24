import {getDreamById} from "../services/dreams.service.js";

export default async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (dream.author.author_id.toString() === res.locals.userIdentity.id) return next();
    res.redirect("/")
}
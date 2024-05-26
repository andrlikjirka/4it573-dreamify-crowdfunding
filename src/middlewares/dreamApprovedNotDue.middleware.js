import {getDreamById} from "../services/dreams.service.js";

export default async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (dream.status === 'approved' && dream.dateDiff > 0) return next();
    console.log(`Dream with status "${dream.status}" and deadline "${dream.dueDate}" cannot accept contributions.`)
    res.redirect("/");
}

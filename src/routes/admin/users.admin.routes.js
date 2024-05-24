import express from "express";
import {findAllUsers, getUserById} from "../../services/users.service.js";
import {getDreamById} from "../../services/dreams.service.js";
import {User} from "../../model/user.model.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get('/users', async (req, res) => {
    const users = await findAllUsers();

    res.render('admin/users/users.index.html', {
       users: users
    });
});

router.put('/users/:id', async (req, res, next) => {
    let user = await getUserById(req.params.id);
    if (!user) return next();

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password && req.body.password_confirm) {
        if (req.body.password === req.body.password_confirm){
            user.hash = await bcrypt.hash(req.body.password, 10);
            res.clearCookie('jwt');
        } else {
            console.log('New passwords does not correspond to password confirmation. Update failed.')
            return res.redirect('back');
        }
    }
    if (req.body.blocked) user.blocked = !user.blocked;

    try {
        await user.save();
        console.log(`Successfully updated user info: ${user._id}`);
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('back');
});

router.delete('/users/:id', async (req, res, next) => {
    const user = await getUserById(req.params.id);
    if (!user) return next();

    user.deleted = true;

    try {
        await user.save();
        console.log(`ADMIN: Successfully marked as deleted user: ${user._id}`);
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('back');
});

export default router;
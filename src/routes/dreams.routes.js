import express, {raw} from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {Dream} from "../model/dream.model.js";

const router = express.Router();

router.get('/dreams', async (req, res) => {
    const dreams = await Dream.find(
        {status: 'approved', showed: true, deleted: false},
        {},
        {});
    res.render('dreams/dreams.index.html', {
        dreams: dreams
    });
});

router.post('/dreams', authMiddleware, async (req, res) => {
    const dream = new Dream({
        name: req.body.dreamName,
        summary: req.body.dreamSummary,
        description: req.body.dreamDescription,
        goal: req.body.dreamGoal,
        dueDate: req.body.dreamDate,
        author: {
            author_id: res.locals.user.id,
            author_name: res.locals.user.name
        }
    });
    try {
        await dream.save();
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect(`/`);
});

router.get('/dreams/:id', async (req, res) => {
    const dream =  await Dream.findById(
        {_id: req.params.id},
        {},
        {});
    dream.dateDiff = 'a';
       res.render('dreams/dreams.detail.html', {
        dream: dream
   });
});

router.get('/new-dream', (req, res) => {
   res.render('dreams/dreams.new-dream.html', {});
});

export default router;
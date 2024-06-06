import express from "express";
import {findAllContributionsByDreamId, findAllDreams, getDreamById} from "../../services/dreams.service.js";

const router = express.Router();

router.get('/dreams', async (req, res) => {
    const dreams = await findAllDreams();

    res.render('admin/dreams/dreams.index.html', {
        dreams: dreams
    });
});

router.get('/dreams/:id', async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (!dream) return next();
    const contributions = await findAllContributionsByDreamId(req.params.id);

    res.render('admin/dreams/dreams.detail.html', {
        dream: dream,
        contributions: contributions
    });
});

router.put('/dreams/:id', async (req, res, next) => {
    let dream = await getDreamById(req.params.id);
    if (!dream) return next();

    if (req.body.dreamName) dream.name = req.body.dreamName;
    if (req.body.dreamSummary) dream.summary = req.body.dreamSummary;
    if (req.body.dreamCategory) dream.category = req.body.dreamCategory;
    if (req.body.dreamDescription) dream.description = req.body.dreamDescription;
    if (req.body.dreamStatus) dream.status = req.body.dreamStatus;
    if (req.body.dreamGoal) dream.goal = req.body.dreamGoal;
    if (req.body.dreamDate) dream.dueDate = req.body.dreamDate;
    if (req.body.showed) dream.showed = !dream.showed;

    try {
        await dream.save();
        console.log(`ADMIIN: Successfully updated dream: ${dream._id}`);
        req.session.flash = {type: 'success', message: `Úprava snu proběhla úspěšně.`};
    } catch (err) {
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Úprava snu se nezdařila.`};
        return res.redirect('back');
    }
    res.redirect('back');
});

router.delete('/dreams/:id', async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (!dream) return next();

    dream.deleted = true;

    try {
        await dream.save();
        console.log(`ADMIN: Successfully marked as deleted dream: ${dream._id}`);
        req.session.flash = {type: 'success', message: `Odebrání snu proběhlo úspěšně.`};
    } catch (err) {
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Odebrání snu se nezdařilo.`};
        return res.redirect('back');
    }
    res.redirect('back');
});


export default router;
import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {Dream} from "../../model/dream.model.js";
import fileUploadMiddleware from "../../middlewares/fileUpload.middleware.js";
import * as fs from "fs";
import {findShowedAcceptedDreams, findShowedAcceptedDreamsByCategory} from "../../services/dreams.service.js";

const router = express.Router();

router.get('/dreams', async (req, res) => {
    let dreams;
    if (req.query.category) {
        dreams = await findShowedAcceptedDreamsByCategory(req.query.category);
    } else {
        dreams = await findShowedAcceptedDreams();
    }

    res.render('public/dreams/dreams.index.html', {
        dreams: dreams
    });
});

//TODO: middleware pro validaci dat pro vytvoření snu
router.post('/dreams', authMiddleware, fileUploadMiddleware.single('file'), async (req, res) => {
    const dream = new Dream({
        name: req.body.dreamName,
        summary: req.body.dreamSummary,
        category: req.body.dreamCategory,
        description: req.body.dreamDescription,
        goal: req.body.dreamGoal,
        dueDate: req.body.dreamDate,
        author: {
            author_id: res.locals.user.id,
            author_name: res.locals.user.name
        }
    });
    dream.photos.push({name: req.file.filename});

    try {
        await dream.save();
        console.log(`Successfully added a new dream.`);
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('/my-dreams');
});

router.get('/dreams/:id', async (req, res, next) => {
    const dream =  await Dream.findById(
        {_id: req.params.id},
        {},
        {});

    if (!dream) return next();

    res.render('public/dreams/dreams.detail.html', {
        dream: dream
    });
});

router.get('/new-dream', authMiddleware, (req, res) => {
   res.render('public/dreams/new-dream.html', {});
});

router.get('/my-dreams', authMiddleware, async (req, res) => {
    const myDreams = await Dream.find(
        {"author.author_id": res.locals.user.id, deleted: false},
        {},
        {});

    res.render('public/dreams/my-dreams.index.html', {
        dreams: myDreams
    });
});

router.get('/my-dreams/:id', authMiddleware, async (req, res, next) => {
    const dream = await Dream.findById({_id: req.params.id},{},{});

    if (!dream) return next();

    res.render('public/dreams/my-dreams.edit.html', {
        dream: dream
    });
});

// TODO: middleware na validaci formuláře
router.put('/my-dreams/:id', authMiddleware, async (req, res, next) => {
    let dream = await Dream.findById(
        {_id: req.params.id},
        {},
        {});

    if (!dream) return next();

    if (req.body.dreamName) dream.name = req.body.dreamName;
    if (req.body.dreamSummary) dream.summary = req.body.dreamSummary;
    if (req.body.dreamCategory) dream.category = req.body.dreamCategory;
    if (req.body.dreamDescription) dream.description = req.body.dreamDescription;
    if (req.body.dreamGoal) dream.goal = req.body.dreamGoal;
    if (req.body.dreamDate) dream.dueDate = req.body.dreamDate;
    if (req.body.showed) dream.showed = !dream.showed;

    try {
        await dream.save();
        console.log(`Successfully updated dream: ${dream._id}`);
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('back');
});

router.delete('/my-dreams/:id', authMiddleware, async (req, res, next) => {
   const dream = await Dream.findOne(
       {_id: req.params.id},
       {},
       {});

   if (!dream) return next();

   dream.deleted = true;

    try {
        await dream.save();
        console.log(`Successfully marked as deleted dream: ${dream._id}`);
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('back');
});

router.post('/my-dreams/:id/photos', authMiddleware, fileUploadMiddleware.single('file'), async (req, res, next) => {
    if (!req.file) return res.redirect('back');

    let dream = await Dream.findById(
        {_id: req.params.id},
        {},
        {});

    if (!dream) return next();

    dream.photos.push({name: req.file.filename});
    try {
        await dream.save();
        console.log(`Successfully added a photo to dream: ${dream._id}`);
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('back');
});

router.delete('/my-dreams/:id/photos/:photoId', authMiddleware, async (req, res, next) => {
    let dream = await Dream.findById(req.params.id, {}, {});

    if (!dream) return next();

    let photo = dream.photos.id(req.params.photoId);
    if (!photo) return next(); // If no photo is found, pass to the next middleware
    dream.photos.pull(photo);

    const filePath = 'public/uploads/dreams/' + photo.name;
    try {
        await dream.save();
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${err.message}`);
            }
            console.log(`Successfully deleted file: ${filePath}`);
        });
    } catch (err) {
        console.error(err.message);
        return res.redirect('back');
    }
    res.redirect('back');
});

export default router;
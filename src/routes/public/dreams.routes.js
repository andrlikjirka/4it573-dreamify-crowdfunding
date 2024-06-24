import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {Dream} from "../../model/dream.model.js";
import fileUploadMiddleware from "../../middlewares/fileUpload.middleware.js";
import * as fs from "fs";
import {
    findAllContributionsByDreamId,
    findDreamsByAuthorId,
    findShowedAcceptedDreams,
    findShowedAcceptedDreamsByCategory,
    getContributionById,
    getDreamById,
    getShowedDreamById, saveNewContribution,
} from "../../services/dreams.service.js";
import {startSession} from "mongoose";
import loggedUserIsDreamAuthorMiddleware from "../../middlewares/loggedUserIsDreamAuthor.middleware.js";
import {sendDreamCardToAllConnections, sendDreamDetailToAllConnections} from "../../websockets.js";
import sanitizeHtml from "sanitize-html";
import {PORT, tinyMceOptions} from "../../utils.js";
import dreamApprovedNotDueMiddleware from "../../middlewares/dreamApprovedNotDue.middleware.js";
import * as paypal from "../../services/paypal.service.js";
import {getUserById} from "../../services/users.service.js";

const router = express.Router();

router.get('/dreams', async (req, res) => {
    let dreams;
    if (req.query.category) {
        dreams = await findShowedAcceptedDreamsByCategory(req.query.category);
    } else {
        dreams = await findShowedAcceptedDreams();
    }
    dreams = dreams.filter(dream => dream.dateDiff > 0)
    res.render('public/dreams/dreams.index.html', {
        ws_port: PORT,
        dreams: dreams
    });
});

router.post('/dreams', authMiddleware, fileUploadMiddleware.single('file'), async (req, res) => {

    const dream = new Dream({
        name: req.body.dreamName,
        summary: req.body.dreamSummary,
        category: req.body.dreamCategory,
        description: sanitizeHtml(req.body.dreamDescription, tinyMceOptions),
        goal: req.body.dreamGoal,
        dueDate: req.body.dreamDate,
        author: {
            author_id: res.locals.userIdentity.id,
            author_name: res.locals.userIdentity.name
        }
    });
    dream.photos.push({name: req.file.filename});

    try {
        await dream.save();
        console.log(`Successfully added a new dream.`);
        req.session.flash = {type: 'success', message: `Přidání Vašeho nového snu proběhlo úspěšně.`};
    } catch (err) {
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Přidání Vašeho nového snu se nezdařilo.`};
        return res.redirect('back');
    }
    res.redirect('/my-dreams');
});

router.get('/dreams/:id', async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (!dream) return next();

    const contributions = await findAllContributionsByDreamId(req.params.id);

    res.render('public/dreams/dreams.detail.html', {
        ws_port: PORT,
        dream: dream,
        contributions: contributions
    });
});

router.get('/dreams/:id/contribute', authMiddleware, async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (!dream) return next();

    res.render('public/dreams/contribute.html', {
        dream: dream
    });
});

router.post('/dreams/:id/contribute', authMiddleware, dreamApprovedNotDueMiddleware, async (req, res, next) => {
    const dream = await getShowedDreamById(req.params.id);
    if (!dream) return next();
    const author = await getUserById(dream.author.author_id);

    const contributionData = {
        amount: Number(req.body.contribution),
        contributor: {
            contributor_id: res.locals.userIdentity.id,
            contributor_name: res.locals.userIdentity.name
        },
        dream: {
            dream_id: dream.id,
            dream_name: dream.name
        }
    };

    try {
        const contribution = await saveNewContribution(contributionData);
        const order = await paypal.createOrder(dream._id, dream.name, contribution._id, author.paypal_address, req.body.contribution);
        contribution.payment = {
            payment_id: order.id,
            payment_status: 'PENDING'
        };
        await contribution.save();
        const url = order.links.find(link => link.rel === 'payer-action').href;
        res.redirect(url);
    } catch (err) {
        console.error(err.message);
        return res.redirect('/');
    }
});

router.get('/dreams/:dream_id/contributions/:contribution_id/complete', async (req, res) => {
    const contribution = await getContributionById(req.params.contribution_id);
    contribution.payment.payment_status = 'COMPLETED';
    const dream = await getDreamById(contribution.dream.dream_id)
    dream.pledged += contribution.amount;
    dream.contributors += 1;

    const session = await startSession();
    try {
        session.startTransaction();
        await contribution.save();
        await dream.save();
        await paypal.capturePayment(req.query.token);
        await session.commitTransaction();
        await session.endSession();
        console.log(`Successfully added new contribution to the dream: ${dream.id}`);
        req.session.flash = {type: 'success', message: `Děkujeme za Váš příspěvek na realizaci daného snu.`};
    } catch (error) {
        await session.abortTransaction()
        await session.endSession()
        console.error(error.message);
        req.session.flash = {type: 'danger', message: `Přispěvek na vybraný sen se nepodařilo zpracovat.`};
        return res.redirect('/dreams' + req.params.dream_id);
    }
    sendDreamCardToAllConnections(dream._id)
        .catch((e) => {
            console.error(e)
        });
    sendDreamDetailToAllConnections(dream._id)
        .catch((e) => {
            console.error(e)
        });
    res.redirect('/dreams/' + req.params.dream_id)
})

router.get('/dreams/:dream_id/contributions/:contribution_id/cancel', async (req, res) => {
    const contribution = await getContributionById(req.params.contribution_id);
    contribution.payment.payment_status = 'DECLINED';
    try {
        await contribution.save();
    } catch (error) {
    }
    req.session.flash = { type: 'danger', message: 'Přispěvek na vybraný sen se nepodařilo zpracovat.'};
    res.redirect('/dreams/' + req.params.dream_id);
})

// ----------------------


router.get('/new-dream', authMiddleware, (req, res) => {
    res.render('public/dreams/new-dream.html', {});
});

router.get('/my-dreams', authMiddleware, async (req, res) => {
    const myDreams = await findDreamsByAuthorId(res.locals.userIdentity.id);

    res.render('public/dreams/my-dreams.index.html', {
        dreams: myDreams
    });
});

router.get('/my-dreams/:id', authMiddleware, loggedUserIsDreamAuthorMiddleware, async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (!dream) return next();

    res.render('public/dreams/my-dreams.edit.html', {
        dream: dream
    });
});

// TODO: middleware na validaci formuláře
router.put('/my-dreams/:id', authMiddleware, loggedUserIsDreamAuthorMiddleware, async (req, res, next) => {
    let dream = await getDreamById(req.params.id);
    if (!dream) return next();

    if (req.body.dreamName) dream.name = req.body.dreamName;
    if (req.body.dreamSummary) dream.summary = req.body.dreamSummary;
    if (req.body.dreamCategory) dream.category = req.body.dreamCategory;
    if (req.body.dreamDescription) dream.description = sanitizeHtml(req.body.dreamDescription, tinyMceOptions)
    if (req.body.dreamGoal) dream.goal = req.body.dreamGoal;
    if (req.body.dreamDate) dream.dueDate = req.body.dreamDate;
    if (req.body.showed) dream.showed = !dream.showed;

    try {
        await dream.save();
        console.log(`Successfully updated dream: ${dream._id}`);
        req.session.flash = {type: 'success', message: `Úprava Vašeho snu proběhla úspěšně.`};
    } catch (err) {
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Úprava Vašeho snu se nezdařila.`};
        return res.redirect('back');
    }
    res.redirect('back');
});

router.delete('/my-dreams/:id', authMiddleware, loggedUserIsDreamAuthorMiddleware, async (req, res, next) => {
    const dream = await getDreamById(req.params.id);
    if (!dream) return next();

    dream.deleted = true;
    try {
        await dream.save();
        console.log(`Successfully marked as deleted dream: ${dream._id}`);
        req.session.flash = {type: 'success', message: `Zvolený sen byl úspěšně odebrán.`};
    } catch (err) {
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Odebrání zvoleného snu se nezdařilo.`};
        return res.redirect('back');
    }
    res.redirect('back');
});

router.post('/my-dreams/:id/photos', authMiddleware, loggedUserIsDreamAuthorMiddleware, fileUploadMiddleware.single('file'), async (req, res, next) => {
    if (!req.file) return res.redirect('back');

    let dream = await getDreamById(req.params.id);
    if (!dream) return next();

    dream.photos.push({name: req.file.filename});
    try {
        await dream.save();
        console.log(`Successfully added a photo to dream: ${dream._id}`);
        req.session.flash = {type: 'success', message: `Nahrání obrázku k vašemu snu proběhlo úspěšně.`};
    } catch (err) {
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Nahrání obrázku k vašemu snu se nezdařilo.`};
        return res.redirect('back');
    }
    res.redirect('back');
});

router.delete('/my-dreams/:id/photos/:photoId', authMiddleware, loggedUserIsDreamAuthorMiddleware, async (req, res, next) => {
    let dream = await getDreamById(req.params.id)
    if (!dream) return next();

    let photo = dream.photos.id(req.params.photoId);
    if (!photo) return next(); // If no photo is found, pass to the next middleware
    dream.photos.pull(photo);

    const filePath = 'public/uploads/dreams/' + photo.name;
    const session = await startSession();
    try {
        session.startTransaction();
        await dream.save();
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${err.message}`);
            } else {
                console.log(`Successfully deleted file: ${filePath}`);
            }
        });
        await session.commitTransaction();
        await session.endSession();
    } catch (err) {
        await session.abortTransaction()
        await session.endSession()
        console.error(err.message);
        req.session.flash = {type: 'danger', message: `Odebrání obrázku se nezdařilo.`};
        return res.redirect('back');
    }
    req.session.flash = {type: 'success', message: `Odebrání obrázku proběhlo úspěšně.`};
    res.redirect('back');
});

export default router;
import express from "express";
import dreamsRoutes from "./public/dreams.routes.js";
import usersRoutes from "./public/users.routes.js";
import app from "../app.js";

const router = express.Router();

router.get('/', async (req,res) => {
    res.render('public/index.html', {});
});
router.get('/about', (req, res) => {
    res.render('public/about.html', {});
});

router.use(dreamsRoutes);
router.use(usersRoutes);

export default router;
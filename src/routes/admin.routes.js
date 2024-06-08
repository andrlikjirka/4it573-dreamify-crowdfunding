import express from "express";
import dreamsAdminRoutes from "./admin/dreams.admin.routes.js";
import usersAdminRoutes from "./admin/users.admin.routes.js";

const router = express.Router();

router.get('/', async (req,res) => {
    res.render('admin/index.html', {});
});

router.use(dreamsAdminRoutes);
router.use(usersAdminRoutes);

export default router;
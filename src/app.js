import express from 'express';
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import {connectDB} from "./db/db.js";
import dreamsRoutes from "./routes/public/dreams.routes.js";
import method_override from 'method-override';
import loadUserMiddleware from "./middlewares/loadUser.middleware.js";
import usersRoutes from "./routes/public/users.routes.js";
import dateFilter from "nunjucks-date-filter";
import mongoose from "mongoose";
import {categories, dreamStatus} from "./utils.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import adminMiddleware from "./middlewares/admin.middleware.js";

const app = express();

// utils
app.locals.categories = categories;
app.locals.dreamStatus = dreamStatus;

let env = nunjucks.configure('src/views', {
    autoescape: true,
    express: app
});
env.addFilter('date', dateFilter);

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(method_override('_method'));

await connectDB();
mongoose.set('debug', true);

app.use(loadUserMiddleware);

// public module
app.get('/', async (req,res) => {
    res.render('public/index.html', {});
});

app.use(usersRoutes);
app.use(dreamsRoutes);
// end: public module

// admin module
app.get('/admin', authMiddleware, adminMiddleware, async (req,res) => {
    res.render('admin/index.html', {});
});


// end: admin module

app.use((req, res, next) => {
    res.status(404);
    res.send('Stránka nenalezena')
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Něco se nepovedlo :(');
});

export default app;
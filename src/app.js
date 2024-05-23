import express from 'express';
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import {connectDB} from "./db/db.js";
import dreamsRoutes from "./routes/dreams.routes.js";
import method_override from 'method-override';
import loadUserMiddleware from "./middlewares/loadUser.middleware.js";
import usersRoutes from "./routes/users.routes.js";
import dateFilter from "nunjucks-date-filter";
import mongoose from "mongoose";
import {categories, dreamStatus} from "./utils.js";

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

app.use(loadUserMiddleware);

app.get('/', async (req,res) => {
    res.render('public/index.html', {});
});

mongoose.set('debug', true);

app.use(usersRoutes);
app.use(dreamsRoutes);

app.use((req, res, next) => {
    res.status(404);
    res.send('Stránka nenalezena')
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Něco se nepovedlo :(');
});

export default app;
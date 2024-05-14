import express from 'express';
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import projectsRoutes from "./routes/projects.routes.js";
import {connectDB} from "./db/db.js";

const app = express();

nunjucks.configure('src/views', {
    autoescape: true,
    express: app
});
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));

await connectDB();

app.get('/', (req,res) => {
    res.render('index.html', {

    });
});

app.use(projectsRoutes);

app.use((req, res, next) => {
    res.status(404);
    res.send('Stránka nenalezena')
});

export default app;
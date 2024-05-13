import express from 'express';
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";

const app = express();

nunjucks.configure('src/views', {
    autoescape: true,
    express: app
});
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('index.html');
})

app.use((req, res, next) => {
    res.status(404);
    res.send('Stránka nenalezena')
});

export default app;
export default (req, res, next) => {
    if (res.locals.user.role === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
}

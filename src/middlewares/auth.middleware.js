export default (req, res, next) => {
    if (res.locals.userIdentity) {
        next();
    } else {
        res.redirect('/login');
    }
}

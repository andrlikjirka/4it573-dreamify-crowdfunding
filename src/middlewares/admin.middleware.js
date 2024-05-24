export default (req, res, next) => {
    if (res.locals.user.role === 'admin') {
        next();
    } else {
        console.log('No required admin role.')
        res.redirect('/');
    }
}

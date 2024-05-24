export default (req, res, next) => {
    if (res.locals.userIdentity.role === 'admin') {
        next();
    } else {
        console.log('No required admin role.')
        res.redirect('/');
    }
}

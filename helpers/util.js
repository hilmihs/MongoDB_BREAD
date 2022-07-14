module.exports = {
    isLoggedIn: (req, res, next) => {
        console.log(req.session, req.session.user)
        if (req.session && req.session.user) {
            return next()
        }
        res.redirect('/login')
    }
}
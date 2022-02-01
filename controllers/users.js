const User = require('../models/user');

module.exports.renderSignUp = (req, res) => {
    res.render('auth/signup');
}

module.exports.signUpUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username });
        const register = await User.register(user, password); //salts the password and saves the hash
        req.login(register, err => {
            if (err) return next(err);
            req.flash('success', `Welcome ${username}!`);
            res.redirect('/tasks');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('auth/login');
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirect = '/tasks';
    delete req.session.returnTo; //removes stored url 
    res.redirect(redirect);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Successfully logged out");
    res.redirect('/');
}
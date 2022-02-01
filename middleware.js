const ExpressError = require('./utils/ExpressError');
const { taskSchema } = require('./schemas');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateTask = (req, res, next) => {
    //joi validates with declared schema before saving to mongo
    const { error } = taskSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.verifyOwner = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user.tasks.includes(id)) {
        req.flash('error', 'Invalid Task');
        return res.redirect(`/tasks`);
    }
    next();
}
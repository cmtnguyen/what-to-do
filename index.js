if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStratagy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app = express();
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/taskApp';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "database connection error"));
db.once("open", () => {
    console.log("database connected")
});

app.use('/styles', express.static('styles'));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //allow use of public scripts
app.use(mongoSanitize());

const secret = process.env.SECRET || 'secretCode'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //time period is in seconds (24 hours)
})

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, //uncomment when deploying to secure site
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7, //millsec sec min hour day -> expires week from now
        maxAge: 1000 * 60 * 60 * 24 * 7 //user must log in again a week after they sign in
    }
};
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session()); //call this after calling session
//passport static methods
passport.use(new LocalStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //stores user in session
passport.deserializeUser(User.deserializeUser()); //remove user from session
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://fonts.googleapis.com/",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'"],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res) => { //every request for every path not mentioned above
    res.render('tasks/notFound');
})

app.use((err, req, res, next) => { //catches errors
    const { status = 500 } = err;
    if (!err.message) err.message = 'problem';
    res.status(status).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`PORT ${port} SERVING`);
});
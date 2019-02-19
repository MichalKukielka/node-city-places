require('dotenv').config();

const express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    localStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    flash          = require("connect-flash"),


    Place          = require("./models/place"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    seedDB         = require("./seeds");


const placeRoutes    = require("./routes/places"),
    commentRoutes  = require("./routes/comments"),
    indexRoutes    = require("./routes/index");
    

const db = require('./key').MongoURI;
mongoose.connect( "mongodb://localhost:27017/city_places", { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "vfdsagjadfklgvadsfgbadfbdvpjmgbvzcjnxm`;Di3243tgqsradv90zhione;jkfavxc",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.cityTitle = req.city;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});


app.use(indexRoutes);
app.use(placeRoutes);
app.use(commentRoutes);



app.use((req, res, next) => {
    res.status(404).render('errors/404');
});

app.listen(3001, 'localhost', () => {
    console.log('Course project app has started!');
});

